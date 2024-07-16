import { JWT_SECRET } from '$env/static/private';
import { JWTPayloadSchema, TokenSchema } from '$lib/server/validation';
import { redirect, type Handle } from '@sveltejs/kit';
import jsonwebtoken from 'jsonwebtoken';

export const handle = async function ({ event, resolve }) {
	const token = event.cookies.get('token');
	const jwt = event.cookies.get('jwt');

	if (event.request.url.includes('admin')) {
		if (jwt) {
			try {
				const payload = jsonwebtoken.verify(jwt, JWT_SECRET, { algorithms: ['HS256'] });
				const { data, success } = JWTPayloadSchema.safeParse(payload);

				event.locals.isAdmin = success && data.isAdmin;
			} catch (error) {
				event.cookies.delete('jwt', { path: '/' });
				event.locals.isAdmin = false;
			}
		} else {
			event.locals.isAdmin = false;
		}
	}

	if (token) {
		const validation = TokenSchema.safeParse(token);
		if (!validation.success) {
			event.cookies.delete('token', { path: '/' });
			throw redirect(303, '/');
		}

		event.locals.token = validation.data;
	}

	const response = await resolve(event);
	return response;
} satisfies Handle;
