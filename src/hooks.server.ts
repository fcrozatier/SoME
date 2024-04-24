import { redirect, type Handle } from '@sveltejs/kit';
import { TokenSchema } from '$lib/server/validation';
import { compare } from 'bcrypt';
import { ADMIN_PASSWORD } from '$env/static/private';

export const handle = async function ({ event, resolve }) {
	const token = event.cookies.get('token');

	if (event.request.url.includes('admin')) {
		const adminPassword = event.cookies.get('password');
		if (adminPassword) {
			const isAdmin = await compare(ADMIN_PASSWORD, adminPassword);
			if (!isAdmin) {
				throw redirect(303, '/login');
			}
		} else {
			throw redirect(303, '/login');
		}
	}

	if (token) {
		const validation = TokenSchema.safeParse(token);
		if (!validation.success) {
			event.cookies.delete('token');
			throw redirect(303, '/');
		}

		event.locals.token = validation.data;
	}

	const response = await resolve(event);
	return response;
} satisfies Handle;
