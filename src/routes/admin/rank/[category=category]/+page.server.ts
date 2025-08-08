import { currentYear } from "$lib/config.js";
import { rank } from "$lib/server/algo/queries.js";
import { db } from "$lib/server/db";
import type { SelectEntry } from "$lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async ({ params, locals }) => {
	if (!locals.user?.isAdmin) return error(404);

	const { category } = params;

	const entries: Pick<SelectEntry, "title" | "rank">[] = await db.execute(sql`
		 select title, rank from entries
		 where active='t'
		 and date_part('year', entries.created_at)=${currentYear}
		 and category=${category}
		 order by rank asc
		`);

	return { entries };
};

export const actions = {
	rank: async ({ params }) => {
		const { category } = params;

		await db.execute(rank(category));

		return { success: true };
	},
};
