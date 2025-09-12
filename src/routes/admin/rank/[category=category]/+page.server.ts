import { currentYear } from "$lib/config.js";
import { rank } from "$lib/server/algo/queries.js";
import { db } from "$lib/server/db";
import type { SelectEntry } from "$lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async ({ params, locals, url }) => {
	if (!locals.user?.isAdmin) return error(404);

	const { category } = params;

	let page = url.searchParams.get("page");

	if (!page) {
		url.searchParams.set("page", "1");
		page = "1";
	}

	const limit = 50;

	const entries: (Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	> & {
		overall_median: number | null;
		teacher_median: number | null;
		ranking: string;
		pages: number;
	})[] = await db.execute(sql`
		with
			overall_score as (
				select entry_uid, percentile_cont(0.5) within group (order by score) as median
				from votes
				where date_part('year', created_at)=${currentYear}
				group by entry_uid
			),

			teacher_score as (
				select entry_uid, percentile_cont(0.5) within group (order by score) as median
				from votes join users on votes.user_uid=users.uid
				where date_part('year', votes.created_at)=${currentYear}
				and is_teacher='t'
				group by entry_uid
			),

			rank as (
				select uid, overall_score.median as overall_median, dense_rank() over (order by overall_score.median desc) as ranking
				from entries
				right join overall_score on overall_score.entry_uid=entries.uid
				where category=${category}
				and active='t'
				order by overall_median desc
			),

			paginated as (
				select entries.uid, title, description, category, url, thumbnail, ranking, overall_median, teacher_score.median as teacher_median, count(*) over () as total_items
				from entries
				right join rank on entries.uid=rank.uid
				left join teacher_score on entries.uid=teacher_score.entry_uid
				order by ranking asc
				limit ${limit}
				offset ${(+page - 1) * limit}
			)

			select *, ceil(total_items::numeric / ${limit})::int as pages from paginated;
		`);

	return { entries, pages: entries[0]?.pages ?? 1 };
};

export const actions = {
	rank: async ({ params }) => {
		const { category } = params;

		await db.execute(rank(category));

		return { success: true };
	},
};
