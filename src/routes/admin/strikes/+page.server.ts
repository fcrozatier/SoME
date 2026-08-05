import { CURRENT_YEAR, ENTRY_STATE, STRIKE_STATE } from "$lib/constants";
import { assertIsAdmin } from "$lib/server/authorization";
import { db } from "$lib/server/db";
import { type SelectEntry, type SelectFlag, type SelectStrike } from "$lib/server/db/schema";
import { UidSchema } from "$lib/validation";
import type { Prettify } from "@fcrozatier/ts-helpers";
import { type Actions } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	assertIsAdmin(locals);

	const strikes: Prettify<
		Pick<SelectEntry, "uid" | "title" | "url" | "state"> &
			Pick<SelectStrike, "reason" | "note"> & {
				/**
				 * When was the strike created
				 */
				created_at: SelectFlag["createdAt"];
				/**
				 * When was the entry last updated
				 */
				updated_at: SelectEntry["updatedAt"];
				/**
				 * When was the entry deleted
				 */
				deleted_at: SelectEntry["deletedAt"];
			}
	>[] = await db.execute(sql`
			select distinct uid, title, url, entries.state, updated_at, deleted_at, reason, note, strikes.created_at
			from entries join strikes
			on entries.uid=strikes.entry_uid
			where entries.state in ${[ENTRY_STATE.ActionRequired, ENTRY_STATE.WaitingForReview]}
			and strikes.state=${STRIKE_STATE.Open}
			and date_part('year', entries.created_at)=${CURRENT_YEAR};
	`);

	return { strikes };
};

export const actions: Actions = {
	remove_strike: formgate({ entry_uid: UidSchema }, async (data, { locals }) => {
		assertIsAdmin(locals);

		const entry_uid = data.entry_uid;

		await db.transaction(async (tx) => {
		// Update entry state
			await tx.execute(sql`
			update entries
			set state=${ENTRY_STATE.Active}
			where uid=${entry_uid};
		`);

		// Remove strike
			await tx.execute(sql`
			update strikes
			set state=${STRIKE_STATE.Closed}
			where entry_uid=${entry_uid};
		`);
		});

		return { success: true };
	}),
	deactivate_entry: formgate({ entry_uid: UidSchema }, async (data, { locals }) => {
		assertIsAdmin(locals);

		const entry_uid = data.entry_uid;

		await db.transaction(async (tx) => {
		// Update entry state
			await tx.execute(sql`
			update entries
			set state=${ENTRY_STATE.Inactive}
			where uid=${entry_uid};
		`);

			// Remove strike
			await tx.execute(sql`
				update strikes
				set state=${STRIKE_STATE.Closed}
				where entry_uid=${entry_uid};
			`);
		});

		// Notify creators
		// TODO

		return { success: true };
	}),
};
