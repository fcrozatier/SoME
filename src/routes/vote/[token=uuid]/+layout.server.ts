import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { MAX_AGE } from '$lib/server/config';

export const load: LayoutServerLoad = async (event) => {
	const { token } = event.params;

	// Find user
	const user = (await db.select().from(users).where(eq(users.uid, token)).limit(1))[0];

	if (!user) {
		throw error(
			401,
			'Invalid token: you can use the link you received by email when registering to vote'
		);
	}

	if (token !== event.cookies.get('token')) {
		event.cookies.set('token', token, {
			path: '/',
			maxAge: MAX_AGE
		});
	}
};
