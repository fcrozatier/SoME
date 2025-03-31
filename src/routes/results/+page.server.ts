import { db } from "$lib/server/db";
import type { SelectEntry } from "$lib/server/db/schema.js";
import { resultsAvailable } from "$lib/utils";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async ({ locals }) => {
	if (!resultsAvailable() && !locals.isAdmin) {
		error(400, { message: "Results not available" });
	}

	const top: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "thumbnail" | "url"
	>[] = await db.execute(sql`
		 select uid, title, description, category, thumbnail, url from entries
		 where active='t'
		 and date_part('year', entries.created_at)='2024'
		 order by final_score desc nulls last
     limit 25;
		`);

	return { top };
};
