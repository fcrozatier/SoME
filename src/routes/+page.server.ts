import { driver } from '$lib/server/neo4j';
import { fail, type Actions } from '@sveltejs/kit';
import { EmailForm, validateForm } from '$lib/server/validation';
import { dev } from '$app/environment';
import { sendEmail } from '../lib/server/email';

export const actions: Actions = {
	resend_link: async ({ request }) => {
		const validation = await validateForm(request, EmailForm);

		if (!validation.success) {
			return fail(400, { emailInvalid: true });
		}

		const session = driver.session();

		try {
			// Find user
			const user = await session.executeRead((tx) => {
				return tx.run(
					`
				MATCH (u:User)
				WHERE u.email = $email
				RETURN u.token AS token
			`,
					{
						email: validation.data.email
					}
				);
			});

			if (!user?.records?.length) {
				return fail(400, { emailInvalid: true });
			}
			const token = user.records[0].get('token');

			console.log(`Your personal link is /vote/${token}`);
			if (!dev) {
				await sendEmail(validation.data.email, 'resend_token', { token });
			}
			return { success: true };
		} catch (error) {
			console.log(error);
			return fail(400, { error: true });
		} finally {
			await session.close();
		}
	}
};
