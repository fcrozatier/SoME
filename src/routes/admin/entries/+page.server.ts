import { currentYear } from "$lib/config.js";
import { db } from "$lib/server/db";
import { type SelectEntry } from "$lib/server/db/schema";
import { AdminDeactivateForm } from "$lib/validation";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals, url }) => {
	if (!locals.user?.isAdmin) return error(404);

	let page = url.searchParams.get("page");

	if (!page) {
		url.searchParams.set("page", "1");
		page = "1";
	}
	const limit = 50;

	const entries: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	>[] = await db.execute(sql`
			select uid, title, description, category, url, thumbnail
			from entries
			where entries.active='true'
			and date_part('year', entries.created_at)=${currentYear}
			order by created_at
			limit ${limit}
			offset ${(+page - 1) * limit};
		`);

	const [total] = (await db.execute(sql`
		 select count(*) from entries
		 where entries.active='true'
		 and date_part('year', entries.created_at)=${currentYear};
		`)) as { count: number }[];

	return { entries, pages: Math.ceil((total?.count ?? 0) / limit) };
};

export const actions = {
	deactivate: formgate(AdminDeactivateForm, async (data, { locals }) => {
		if (!locals.user?.isAdmin) return error(403);

		await db.execute(sql`
			update entries set active='false' where uid=${data.uid};
		`);

		return { success: true };
	}),
};
