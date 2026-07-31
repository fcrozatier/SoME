import { CURRENT_YEAR, ENTRY_STATE, STRIKE_STATE } from "$lib/constants";
import { assertIsAdmin } from "$lib/server/authorization";
import { db } from "$lib/server/db";
import { type SelectEntry, type SelectFlag } from "$lib/server/db/schema";
import { AdminActionRequiredForm, AdminDeactivateForm } from "$lib/validation";
import type { Prettify } from "@fcrozatier/ts-helpers";
import { type Actions } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	assertIsAdmin(locals);

	const strikes: Prettify<
		Pick<SelectEntry, "uid" | "title" | "url" | "state"> &
			Pick<SelectFlag, "reason"> & { created_at: string }
	>[] = await db.execute(sql`
			select distinct uid, title, url, entries.state, reason, strikes.created_at
			from entries join strikes
			on entries.uid=strikes.entry_uid
			where entries.state in ${[ENTRY_STATE.ActionRequired, ENTRY_STATE.WaitingForReview]}
			and strikes.state=${STRIKE_STATE.Open}
			and deleted_at is null
			and date_part('year', entries.created_at)=${CURRENT_YEAR};
	`);

	return { strikes };
};

export const actions: Actions = {
	remove_strike: formgate(AdminDeactivateForm, async (data, { locals }) => {
		assertIsAdmin(locals);

		const entry_uid = data.uid;

		// Update entry state
		await db.execute(sql`
			update entries
			set state=${ENTRY_STATE.Active}
			where uid=${entry_uid};
		`);

		// Remove strike
		await db.execute(sql`
			update strikes
			set state=${STRIKE_STATE.Closed}
			where entry_uid=${entry_uid};
		`);

		return { success: true };
	}),
	deactivate_entry: formgate(AdminActionRequiredForm, async (data, { locals }) => {
		assertIsAdmin(locals);

		const entry_uid = data.uid;

		// Update entry state
		await db.execute(sql`
			update entries
			set state=${ENTRY_STATE.Inactive}
			where uid=${entry_uid};
		`);

		// Notify creators
		// TODO !
		console.log(data.uid, data.reason);
		console.log(data.note);

		return { success: true };
	}),
};
