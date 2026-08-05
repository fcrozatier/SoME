import { CURRENT_YEAR, ENTRY_STATE } from "$lib/constants";
import { assertIsAdmin } from "$lib/server/authorization";
import { db } from "$lib/server/db";
import { type SelectEntry, type SelectFlag, strikes } from "$lib/server/db/schema";
import { EMAILS, sendGenericTemplateEmail } from "$lib/server/email.js";
import { parseAndSanitizeMarkdown } from "$lib/utils/markdown.js";
import { relativeTime } from "$lib/utils/time.js";
import { AdminActionRequiredForm, AdminIgnoreFlagForm } from "$lib/validation";
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
			where state=${ENTRY_STATE.Flagged}
			and deleted_at is null
			and date_part('year', entries.created_at)=${CURRENT_YEAR}
			order by uid;
		`);

	const flagged = Object.groupBy(flags, ({ uid }) => uid);

	return { flagged };
};

export const actions: Actions = {
	ignore_flags: formgate(AdminIgnoreFlagForm, async (data, { locals }) => {
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
		const creators: { user_uid: string; email: string }[] = await db.execute(
			sql`
				select user_uid, email
				from users
				join user_to_entry
				on users.uid=user_to_entry.user_uid
				where entry_uid=${entry_uid};
		`,
		);

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
			reason: data.reason,
			note,
		}));

		// Save strikes
		await db.insert(strikes).values(strikesData);

		// Notify creators
		await sendGenericTemplateEmail({
			to: creators.map((c) => c.email),
			data: EMAILS.ActionRequired({
				entryTitle: entry?.title ?? "",
				deadline: String(relativeTime({ days: 3 })),
			}),
		});

		return { flag: true };
	}),
};
