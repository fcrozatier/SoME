import { assertIsLoggedIn } from "$lib/server/authorization.js";
import { CURRENT_YEAR, ENTRY_STATE, type EntryState, STRIKE_STATE } from "$lib/constants";
import { db } from "$lib/server/db";
import { type SelectEntry } from "$lib/server/db/schema.js";
import { UidSchema } from "$lib/validation";
import { fail } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	assertIsLoggedIn(locals);

	const user_uid = locals.user.uid;

	const userEntries: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "thumbnail" | "url" | "createdAt"
	>[] = await db.execute(sql`
      select uid, title, description, category, thumbnail, url, created_at from entries
      inner join user_to_entry
      on entries.uid=user_to_entry.entry_uid
      where user_to_entry.user_uid=${user_uid}
			and deleted_at is null
      order by entries.created_at desc
    `);

	const [strike]: {
		entry_uid: string;
		title: string;
		note: string;
		state: EntryState;
	}[] = await db.execute(sql`
		select entry_uid, title, note, entries.state
		from entries
		join strikes
		on entries.uid=strikes.entry_uid
		where strikes.user_uid=${user_uid}
		and strikes.state=${STRIKE_STATE.Open}
		and entries.state=${ENTRY_STATE.ActionRequired}
		and entries.deleted_at is null
		and date_part('year', entries.created_at)=${CURRENT_YEAR}
		order by strikes.created_at desc
		limit 1;
	`);

	return {
		// @ts-ignore add createdAt prop
		userEntries: userEntries.map((e) => ({ ...e, createdAt: e.created_at })),
		strike,
	};
};

export const actions = {
	ask_review: formgate({ uid: UidSchema }, async (data, { locals }) => {
		assertIsLoggedIn(locals);

		const user_uid = locals.user.uid;
		const entry_uid = data.uid;

		// Make sure user is the creator of entry
		const isCreator =
			(
				await db.execute(sql`
			select * from user_to_entry
			where user_uid=${user_uid} and entry_uid=${entry_uid};
		`)
			).count > 0;

		if (!isCreator) {
			return fail(422, { message: "You're not the creator of this entry" });
		}

		// Update entry state
		await db.execute(sql`
			update entries set state=${ENTRY_STATE.WaitingForReview}
			where uid=${entry_uid};
		`);

		return { success: true };
	}),
};
