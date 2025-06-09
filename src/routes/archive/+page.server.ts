import { db } from "$lib/server/db";
import type { SelectEntry } from "$lib/server/db/schema.js";
import { sql } from "drizzle-orm";
import * as fg from "formgator";
import { loadgate } from "formgator/sveltekit";

export const load = loadgate({
	year: fg.number({ min: 2021 }).optional(),
	category: fg.select(["video", "non-video"]).optional(),
	page: fg.number({ min: 1 }).optional(),
}, async ({ year, category, page }) => {
	const limit = 50;

	if (!year) year = 2024;
	if (!category) category = "video";
	if (!page) page = 1;

	const entries: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "thumbnail" | "url" | "rank"
	>[] = await db.execute(sql`
		 select uid, title, description, category, thumbnail, url, rank from entries
		 where date_part('year', entries.created_at)=${year}
		 and category=${category}
		 order by rank asc nulls last
     limit ${limit}
     offset ${(page - 1) * limit}
		`);

	const [total] = (await db.execute(sql`
		 select count(*) from entries
		 where date_part('year', entries.created_at)=${year}
		 and category=${category}
		`)) as { count: number }[];

	return {
		entries,
		year,
		category,
		page,
		pages: Math.ceil((total?.count ?? 0) / limit),
	};
});
