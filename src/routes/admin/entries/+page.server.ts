import { db } from "$lib/server/db/client";
import { type SelectEntry } from "$lib/server/db/schema";
import { fail } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async ({ url }) => {
	let page = url.searchParams.get("page");

	if (!page) {
		url.searchParams.set("page", "1");
		page = "1";
	}
	const limit = 50;

	const entries: Pick<SelectEntry, "uid" | "title">[] = await db.execute(sql`
			select uid, title
			from entries
			where entries.active='true'
			and date_part('year', entries.created_at)='2024'
			order by created_at
			limit ${limit}
			offset ${(+page - 1) * limit};
		`);

	const total = (
		await db.execute(sql`
		 select count(*) from entries
		 where entries.active='true'
		 and date_part('year', entries.created_at)='2024';
		`)
	)[0] as { count: number };

	return { entries, pages: Math.ceil(total.count / limit) };
};

export const actions = {
	display: async ({ request }) => {
		const uid = (await request.formData()).get("uid")?.toString();

		if (!uid) return fail(400);

		const entry: Pick<
			SelectEntry,
			"uid" | "title" | "url" | "description" | "category" | "thumbnail"
		>[] = await db.execute(sql`
			select uid, title, url, description, category, thumbnail
			from entries where uid=${uid}
			`);

		return { success: true, entry: entry[0] };
	},
};
