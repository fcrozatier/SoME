import { assertIsAdmin } from "$lib/authorizations";
import { CURRENT_YEAR } from "$lib/constants.js";
import { db } from "$lib/server/db";
import { type SelectEntry } from "$lib/server/db/schema";
import { sql } from "drizzle-orm";

export const load = async ({ locals }) => {
	assertIsAdmin(locals);

	const feedbacks: (Pick<SelectEntry, "uid" | "title" | "url"> & {
		feedback: string;
		user_uid: string;
	})[] = await db.execute(sql`
			select uid, title, url, user_uid, feedback
			from entries join votes
			on uid=entry_uid
			where entries.active='true'
			and deleted_at is null
			and date_part('year', entries.created_at)=${CURRENT_YEAR}
			and votes.reviewed='false'
			and votes.maybe_rude='true'
			order by uid;
		`);

	return { feedbacks };
};

export const actions = {
	keep: async ({ request, locals }) => {
		assertIsAdmin(locals);

		const formData = await request.formData();
		const uids = Array.from(formData).map(([_, uid]) => (uid as string).split(","));

		await db.execute(sql`
				update votes set maybe_rude='false', reviewed='true' where (user_uid, entry_uid) in ${uids}
			`);

		return { success: true };
	},
	remove: async ({ locals, request }) => {
		assertIsAdmin(locals);

		const formData = await request.formData();
		const uids = Array.from(formData).map(([_, uid]) => (uid as string).split(","));

		await db.execute(sql`
				update votes set maybe_rude='true', reviewed='true' where (user_uid, entry_uid) in ${uids}
			`);

		return { success: true };
	},
};
