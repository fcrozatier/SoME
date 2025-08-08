import { currentYear } from "$lib/config.js";
import { db } from "$lib/server/db";
import { type SelectEntry, type SelectFlag } from "$lib/server/db/schema";
import { AdminForm } from "$lib/validation";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import * as fg from "formgator/sveltekit";

export const load = async ({ locals }) => {
	if (!locals.user?.isAdmin) return error(404);

	const flagged: (Pick<SelectEntry, "uid" | "title" | "url"> & Pick<SelectFlag, "reason">)[] =
		await db.execute(sql`
			select uid, title, url, reason
			from entries join flags
			on uid=entry_uid
			where entries.active='false'
			and date_part('year', entries.created_at)=${currentYear}
			order by uid
			limit all
			offset 0;
		`);

	return { flagged };
};

export const actions = {
	reactivate: fg.formgate(AdminForm, async (data) => {
		await db.execute(sql`
			update entries set active='true' where uid in ${data.selected};
		`);

		return { flag: true };
	}),
};
