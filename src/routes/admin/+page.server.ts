import { ADMIN_PASSWORD, JWT_SECRET } from '$env/static/private';
import { MAX_AGE } from '$lib/server/config';
import { db } from '$lib/server/db/client.js';
import { users } from '$lib/server/db/schema.js';
import { PasswordForm, validateForm } from '$lib/validation';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import jsonwebtoken from 'jsonwebtoken';

export const actions = {
	login: async ({ request, cookies }) => {
		console.log('admin login attempt');
		const validation = await validateForm(request, PasswordForm);

		if (!validation.success) {
			return fail(400, { invalid: true });
		}

		const passwordValid = validation.data.password === ADMIN_PASSWORD;

		if (!passwordValid) {
			return fail(400, { invalid: true });
		}

		const r = (
			await db
				.select({ isAdmin: users.isAdmin })
				.from(users)
				.where(eq(users.email, validation.data.email))
		)[0];

		if (!r?.isAdmin) {
			return fail(400, { invalid: true });
		}

		const jwt = jsonwebtoken.sign({ isAdmin: r.isAdmin }, JWT_SECRET, {
			algorithm: 'HS256',
			allowInsecureKeySizes: false,
		});

		cookies.set('jwt', jwt, {
			httpOnly: true,
			path: '/',
			maxAge: MAX_AGE,
			sameSite: 'strict',
			secure: true,
		});
	},
};
