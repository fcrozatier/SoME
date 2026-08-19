import { assertIsAdmin } from "$lib/server/authorization";
import { CURRENT_YEAR, ENTRY_STATE, VOTE_STATE } from "$lib/constants.js";
import { rank } from "$lib/server/algo/queries.js";
import { db } from "$lib/server/db";
import type { SelectEntry } from "$lib/server/db/schema.js";
import { sql } from "drizzle-orm";

export const load = async ({ params, locals, url }) => {
	assertIsAdmin(locals);

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
		median: number | null;
		nb_votes: number;
		nb_skips: number;
		ranking: string;
		pages: number;
	})[] = await db.execute(sql`
		with
			data as (
				select entry_uid, percentile_cont(0.5) within group (order by score) as median, count(*)::int as nb_votes
				from votes
				where date_part('year', created_at)=${CURRENT_YEAR}
				and state=${VOTE_STATE.Active}
				group by entry_uid
			),

			skips_cte as (
				select count(*)::int
				from skips
				where date_part('year', created_at)=${CURRENT_YEAR}
				and state=${VOTE_STATE.Active}
				group by entry_uid
			),

			rank as (
				select distinct uid, median, nb_votes, skips_cte.count as nb_skips, dense_rank() over (order by median desc) as ranking
				from entries
				join data on entry_uid=entries.uid
				join skips_cte on entry_uid=entries.uid
				where category=${category}
				order by median desc
			),

			paginated as (
				select entries.uid, title, description, category, created_at, url, thumbnail, ranking, median, nb_votes, nb_skips, count(*) over () as total_items
				from entries
				right join rank on entries.uid=rank.uid
				where entries.state=${ENTRY_STATE.Active}
				order by (ranking, created_at) asc
				limit ${limit}
				offset ${(+page - 1) * limit}
			)

			select *, ceil(total_items::numeric / ${limit})::int as pages from paginated;
		`);

	return { entries, pages: entries[0]?.pages ?? 1 };
};

export const actions = {
	rank: async ({ params, locals }) => {
		assertIsAdmin(locals);

		const { category } = params;

		await db.execute(rank(category));

		return { success: true };
	},
};
