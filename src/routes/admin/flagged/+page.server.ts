import { assertIsAdmin } from "$lib/authorizations";
import { CURRENT_YEAR, ENTRY_STATE } from "$lib/constants";
import { db } from "$lib/server/db";
import { type SelectEntry, type SelectFlag, strikes } from "$lib/server/db/schema";
import { parseAndSanitizeMarkdown } from "$lib/utils/markdown.js";
import { AdminActionRequiredForm, AdminDeactivateForm } from "$lib/validation";
import type { Prettify } from "@fcrozatier/ts-helpers";
import { type Actions } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	assertIsAdmin(locals);

	const flags: Prettify<Pick<SelectEntry, "uid" | "title" | "url"> & Pick<SelectFlag, "reason">>[] =
		await db.execute(sql`
			select uid, title, url, reason
			from entries join flags
			on uid=entry_uid
			where entries.active='true'
			and state=${ENTRY_STATE.Flagged}
			and deleted_at is null
			and date_part('year', entries.created_at)=${CURRENT_YEAR}
			order by uid;
		`);

	const flagged = Object.groupBy(flags, ({ uid }) => uid);

	return { flagged };
};

export const actions: Actions = {
	ignore_flags: formgate(AdminDeactivateForm, async (data, { locals }) => {
		assertIsAdmin(locals);

		// Update entry state
		await db.execute(sql`
			update entries
			set state=${ENTRY_STATE.Active}
			where uid=${data.uid};
		`);

		return { success: true };
	}),
	action_required: formgate(AdminActionRequiredForm, async (data, { locals }) => {
		assertIsAdmin(locals);

		const entry_uid = data.uid;

		// Retrieve entry creators
		const creators: { user_uid: string }[] = await db.execute(sql`
			select user_uid from user_to_entry
			where entry_uid=${entry_uid};
		`);

		// Update entry state
		await db.execute(sql`
			update entries
			set state=${ENTRY_STATE.ActionRequired}
			where uid=${entry_uid};
		`);

		// Generate HTML
		const note = await parseAndSanitizeMarkdown(data.note);

		const strikesData = creators.map((c) => ({
			userUid: c.user_uid,
			entryUid: entry_uid,
			reason: data.reason,
			note,
		}));

		// Save strikes
		await db.insert(strikes).values(strikesData);

		// Notify creators
		// TODO
		console.log(data.uid, data.reason);
		console.log(data.note);

		return { flag: true };
	}),
};
