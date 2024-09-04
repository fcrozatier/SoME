import { dev } from '$app/environment';
import { db } from '$lib/server/db/client';
import { users, type SelectEntry } from '$lib/server/db/schema';
import { EmailForm, validateForm } from '$lib/server/validation';
import { fail, type Actions } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { sendEmail } from '../lib/server/email';

export const load = async ({ locals }) => {
	const top: Pick<
		SelectEntry,
		'uid' | 'title' | 'description' | 'category' | 'thumbnail' | 'url'
	>[] = await db.execute(sql`
		 select uid, title, description, category, thumbnail, url from entries
		 where active='t'
		 and date_part('year', entries.created_at)='2024'
		 order by final_score desc nulls last
     limit 25;
		`);

	return { top };
};

export const actions: Actions = {
	resend_link: async ({ request }) => {
		const validation = await validateForm(request, EmailForm);

		if (!validation.success) {
			return fail(400, { error: true, emailInvalid: true });
		}

		try {
			// Find user
			const user = (await db.select().from(users).where(eq(users.email, validation.data.email)))[0];

			if (!user) {
				return fail(400, {
					error: true,
					message: "email not found. Did you register to this year's event?",
				});
			}
			const token = user.uid;

			console.log(`Your personal link is /vote/${token}`);
			if (!dev) {
				await sendEmail(validation.data.email, 'resend_token', { token });
			}
			return { success: true };
		} catch (error) {
			console.log(error);
			return fail(400, { error: true, message: 'Something went wrong' });
		}
	},
};
