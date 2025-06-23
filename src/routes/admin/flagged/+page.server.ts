import { currentYear } from "$lib/config";
import { db } from "$lib/server/db";
import { type SelectEntry, type SelectFlag } from "$lib/server/db/schema";
import { AdminForm } from "$lib/validation";
import { type Actions } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async () => {
	const flagged: (Pick<SelectEntry, "uid" | "title" | "url"> & Pick<SelectFlag, "reason">)[] =
		await db.execute(sql`
			select uid, title, url, reason
			from entries join flags
			on uid=entry_uid
			where entries.active='true'
			and date_part('year', entries.created_at)=${currentYear}
			order by uid
			limit all
			offset 0;
		`);

	return { flagged };
};

export const actions: Actions = {
	ignore: formgate(AdminForm, async (data) => {
		await db.execute(sql`
			delete from flags where entry_uid in ${data.selected};
		`);

		return { success: true };
	}),
	deactivate: formgate(AdminForm, async (data) => {
		await db.execute(sql`
			update entries set active='false' where uid in ${data.selected};
		`);

		return { flag: true };
	}),
};
