import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db/client';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async (event) => {
	const { token } = event.params;

	try {
		// Find user
		const user = (await db.select().from(users).where(eq(users.uid, token)).limit(1))[0];

		if (!user) {
			throw error(401, 'Invalid token: you can use the link you received by email to vote');
		}
	} catch (error) {
		console.log(error);
		throw error;
	}
};
