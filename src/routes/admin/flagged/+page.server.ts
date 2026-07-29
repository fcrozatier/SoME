import { currentYear } from "$lib/config";
import { db } from "$lib/server/db";
import {
	ENTRY_STATE,
	type SelectEntry,
	type SelectFlag,
} from "$lib/server/db/schema";
import { AdminDeactivateForm } from "$lib/validation";
import type { Prettify } from "@fcrozatier/ts-helpers";
import { type Actions, error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	if (!locals.user?.isAdmin) return error(404);

	const flags: (Prettify<
		Pick<SelectEntry, "uid" | "title" | "url"> & Pick<SelectFlag, "reason">
	>)[] = await db.execute(sql`
			select uid, title, url, reason
			from entries join flags
			on uid=entry_uid
			where entries.active='true'
			and state=${ENTRY_STATE.Flagged}
			and deleted_at is null
			and date_part('year', entries.created_at)=${currentYear}
			order by uid;
		`);

	const flagged = Object.groupBy(flags, ({ uid }) => uid);

	return { flagged };
};

export const actions: Actions = {
	ignore_flags: formgate(AdminDeactivateForm, async (data) => {
		await db.execute(sql`
			update entries set state=${ENTRY_STATE.Active} where uid=${data.uid};
		`);

		return { success: true };
	}),
	action_required: formgate(AdminDeactivateForm, async (data) => {
		await db.execute(sql`
			update entries set state=${ENTRY_STATE.ActionRequired} where uid=${data.uid};
		`);

		return { flag: true };
	}),
};
