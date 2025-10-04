import { defaultYear } from "$lib/config.js";
import { db } from "$lib/server/db";
import type { SelectEntry } from "$lib/server/db/schema.js";
import { sql } from "drizzle-orm";
import * as fg from "formgator";
import { loadgate } from "formgator/sveltekit";

export const load = loadgate(
	{
		year: fg.number({ min: 2021, max: defaultYear }).optional(),
		category: fg.select(["video", "non-video"]).optional(),
		page: fg.number({ min: 1 }).optional(),
	},
	async ({ year, category, page }) => {
		const limit = 50;

		if (!year) year = defaultYear;
		if (!category) category = "video";
		if (!page) page = 1;

		const entries: (Pick<
			SelectEntry,
			"uid" | "title" | "description" | "category" | "thumbnail" | "url" | "rank"
		> & { pages: number })[] = await db.execute(sql`
			with paginated as (
				select uid, title, description, category, thumbnail, url, rank, count(*) over () as total
				from entries
				where date_part('year', entries.created_at)=${year}
				and category=${category}
				order by (rank, created_at) asc nulls last
				limit ${limit}
				offset ${(page - 1) * limit}
			)
			select *, ceil(total::numeric / ${limit})::int as pages from paginated;
		`);

		return {
			entries,
			year,
			category,
			page,
			pages: entries[0]?.pages ?? 1,
		};
	},
);
