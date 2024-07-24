import { db } from '$lib/server/db/client';
import { type SelectEntry } from '$lib/server/db/schema';
import { FeedbackForm, validateForm } from '$lib/server/validation';
import { fail } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

export const load = async () => {
	const feedbacks: (Pick<SelectEntry, 'uid' | 'title' | 'url'> & {
		feedback: string;
		user_uid: string;
	})[] = await db.execute(sql`
			select user_uid, uid, feedback, title, url
			from entries join votes
			on uid=entry_uid
			where entries.active='true'
			and votes.reviewed='false'
			and votes.maybe_rude='true'
			order by uid
			limit all
			offset 0;
		`);

	return { feedbacks };
};

export const actions = {
	keep: async ({ request }) => {
		const validation = await validateForm(request, FeedbackForm);

		if (!validation.success) {
			return fail(400, { error: true });
		}

		try {
			await db.execute(sql`
					update votes set maybe_rude='false', reviewed='true' where (user_uid, entry_uid) in ${validation.data.selection}
				`);

			return { success: true };
		} catch (error) {
			return fail(400, { error: true });
		}
	},
	remove: async ({ request }) => {
		const validation = await validateForm(request, FeedbackForm);

		if (!validation.success) {
			return fail(400, { error: true });
		}

		try {
			await db.execute(sql`
					update votes set maybe_rude='true', reviewed='true' where (user_uid, entry_uid) in ${validation.data.selection}
				`);

			return { success: true };
		} catch (error) {
			return fail(400, { error: true });
		}
	},
};
