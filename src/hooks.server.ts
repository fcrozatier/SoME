import { JWT_SECRET } from '$env/static/private';
import { MAX_AGE } from '$lib/server/config';
import { client, db } from '$lib/server/db/client';
import { usersToEntries } from '$lib/server/db/schema';
import { JWTPayloadSchema, TokenSchema } from '$lib/server/validation';
import { redirect, type Handle } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import jsonwebtoken from 'jsonwebtoken';

process.on('sveltekit:shutdown', (reason) => {
	console.log('\nclosing db connections, reason', reason);
	client.end();
});

// I'm a teapot
const tea = /(\.php$|\.env|\.xml$|\.git|wordpress|wp-admin)/;

export const handle = async function ({ event, resolve }) {
	if (tea.test(event.request.url)) {
		return new Response(null, { status: 418 });
	}

	const token = event.cookies.get('token');
	const is_creator = event.cookies.get('is_creator');
	const jwt = event.cookies.get('jwt');

	let isCreator = is_creator;

	if (is_creator === undefined && token) {
		isCreator = (
			(await db.select().from(usersToEntries).where(eq(usersToEntries.userUid, token))).length > 0
		).toString();

		event.cookies.set('is_creator', isCreator, {
			path: '/',
			maxAge: MAX_AGE,
		});
	}

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

	event.locals.isCreator = isCreator === 'true';

	if (token) {
		const validation = TokenSchema.safeParse(token);
		if (!validation.success) {
			event.cookies.delete('token', { path: '/' });
			redirect(303, '/');
		}

		event.locals.token = validation.data;
	}

	const response = await resolve(event);
	return response;
} satisfies Handle;
