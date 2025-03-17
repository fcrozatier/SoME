import { db } from "$lib/server/db/client.js";
import type { SelectEntry } from "$lib/server/db/schema.js";
import { resultsAvailable } from "$lib/utils.js";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async ({ params, locals, url }) => {
	if (!resultsAvailable() && !locals.isAdmin) {
		error(400, { message: "Results not available" });
	}

	let page = url.searchParams.get("page");
	const limit = 50;

	if (!page) {
		url.searchParams.set("page", "1");
		page = "1";
	}

	const { category } = params;
	const entries: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "thumbnail" | "url" | "rank"
	>[] = await db.execute(sql`
		 select uid, title, description, category, thumbnail, url, rank from entries
		 where active='t'
		 and date_part('year', entries.created_at)='2024'
		 and category=${category}
		 order by rank asc, created_at nulls last
		 limit ${limit}
     offset ${(+page - 1) * limit}
		`);

	const total = (
		await db.execute(sql`
		 select count(*) from entries
		 where active='t'
		 and date_part('year', entries.created_at)='2024'
		 and category=${category}
		`)
	)[0] as { count: number };

	return { entries, pages: Math.ceil(total.count / limit) };
};
