import { dev } from '$app/environment';
import { db } from '$lib/server/db/client';
import { users } from '$lib/server/db/schema';
import { EmailForm, validateForm } from '$lib/server/validation';
import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { sendEmail } from '../lib/server/email';

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
				console.log('nono');
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
