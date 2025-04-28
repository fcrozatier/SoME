import type { Category } from "$lib/config.js";
import { db } from "$lib/server/db";
import type { SelectEntry } from "$lib/server/db/schema.js";
import { sql } from "drizzle-orm";

export const load = async ({ url }) => {
	let year = url.searchParams.get("year");
	let category = url.searchParams.get("category") as Category;
	let page = url.searchParams.get("page");
	const limit = 50;

	if (!year) {
		url.searchParams.set("year", "2024");
		year = "2024";
	}

	if (!category) {
		url.searchParams.set("category", "video");
		category = "video";
	}

	if (!page) {
		url.searchParams.set("page", "1");
		page = "1";
	}

	const entries: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "thumbnail" | "url" | "rank"
	>[] = await db.execute(sql`
		 select uid, title, description, category, thumbnail, url, rank from entries
		 where date_part('year', entries.created_at)=${year}
		 and category=${category}
		 order by rank asc nulls last
     limit ${limit}
     offset ${(+page - 1) * limit}
		`);

	const [total] = (
		await db.execute(sql`
		 select count(*) from entries
		 where date_part('year', entries.created_at)=${year}
		 and category=${category}
		`)
	) as { count: number }[];

	return {
		entries,
		year,
		category,
		page,
		pages: Math.ceil(total?.count ?? 0 / limit),
	};
};
