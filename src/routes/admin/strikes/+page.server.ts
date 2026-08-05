import { CURRENT_YEAR, ENTRY_STATE, STRIKE_STATE } from "$lib/constants.js";
import { assertIsAdmin } from "$lib/server/authorization.js";
import { db } from "$lib/server/db";
import {
	type SelectEntry,
	type SelectFlag,
	type SelectStrike,
	strikes,
} from "$lib/server/db/schema";
import { EMAILS, sendGenericTemplateEmail } from "$lib/server/email";
import { parseAndSanitizeMarkdown } from "$lib/utils/markdown";
import { relativeTime } from "$lib/utils/time";
import { AdminFollowUpActionRequiredForm, UidSchema } from "$lib/validation";
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

		// Retrieve entry creators
		const creators: { email: string }[] = await db.execute(
			sql`
				select email
				from users
				join user_to_entry
				on users.uid=user_to_entry.user_uid
				where entry_uid=${entry_uid};
		`,
		);

		// Update entry state
		const [entry]: { title: string }[] = await db.execute(sql`
			update entries
			set state=${ENTRY_STATE.Active}
			where uid=${entry_uid}
			returning title;
		`);

		// Remove strike
		await db.execute(sql`
			update strikes
			set state=${STRIKE_STATE.Closed}
			where entry_uid=${entry_uid};
		`);

		// Notify creators
		await sendGenericTemplateEmail({
			to: creators.map((c) => c.email),
			data: EMAILS.StrikeResolved({
				entryTitle: entry?.title ?? "",
			}),
		});

		return { success: true };
	}),
	action_required: formgate(AdminFollowUpActionRequiredForm, async (data, { locals }) => {
		assertIsAdmin(locals);

		const entry_uid = data.uid;

		// Retrieve entry creators
		const creators: { user_uid: string; email: string }[] = await db.execute(
			sql`
					select user_uid, email
					from users
					join user_to_entry
					on users.uid=user_to_entry.user_uid
					where entry_uid=${entry_uid};
			`,
		);

		// Close the old strikes
		const [strike]: { reason: string }[] = await db.execute(sql`
				update strikes
				set state=${STRIKE_STATE.Closed}
				where entry_uid=${data.uid}
				returning reason;
			`);

		// Update entry state
		const [entry]: { title: string }[] = await db.execute(sql`
				update entries
				set state=${ENTRY_STATE.ActionRequired}
				where uid=${entry_uid}
				returning title;
			`);

		// Generate note HTML
		const note = await parseAndSanitizeMarkdown(data.note);

		const strikesData = creators.map((c) => ({
			userUid: c.user_uid,
			entryUid: entry_uid,
			reason: strike?.reason ?? "",
			note,
		}));

		// Save strikes
		await db.insert(strikes).values(strikesData);

		// Notify creators
		await sendGenericTemplateEmail({
			to: creators.map((c) => c.email),
			data: EMAILS.FollowUpActionRequired({
				entryTitle: entry?.title ?? "",
				deadline: String(relativeTime({ days: 3 })),
			}),
		});

		return { flag: true };
	}),
	deactivate_entry: formgate({ entry_uid: UidSchema }, async (data, { locals }) => {
		assertIsAdmin(locals);

		const entry_uid = data.entry_uid;

		// Retrieve entry creators
		const creators: { email: string }[] = await db.execute(
			sql`
				select email
				from users
				join user_to_entry
				on users.uid=user_to_entry.user_uid
				where entry_uid=${entry_uid};
		`,
		);

		// Update entry state
		const [entry]: { title: string }[] = await db.execute(sql`
			update entries
			set state=${ENTRY_STATE.Inactive}
			where uid=${entry_uid}
			returning title;
		`);

		// Remove strike
		await db.execute(sql`
			update strikes
			set state=${STRIKE_STATE.Closed}
			where entry_uid=${entry_uid};
		`);

		// Notify creators
		await sendGenericTemplateEmail({
			to: creators.map((c) => c.email),
			data: EMAILS.EntryInactive({
				entryTitle: entry?.title ?? "",
			}),
		});

		return { success: true };
	}),
};
