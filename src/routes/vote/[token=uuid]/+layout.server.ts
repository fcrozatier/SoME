import { MAX_AGE } from '$lib/server/config';
import { driver } from '$lib/server/neo4j';
import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { TokenSchema } from '$lib/server/validation';

export const load: LayoutServerLoad = async (event) => {
	const { token } = event.params;

	if (!TokenSchema.safeParse(token).success) {
		throw error(400, 'Bad request');
	}

	event.cookies.set('token', token, {
		path: '/',
		maxAge: MAX_AGE
	});

	const session = driver.session();

	try {
		// Find user
		const user = await session.executeRead((tx) => {
			return tx.run(
				`
				MATCH (u:User)
				WHERE u.token = $token
				RETURN u
      `,
				{
					token
				}
			);
		});

		if (!user?.records?.length) {
			throw error(401, 'Invalid token: you can use the link you received by email to vote');
		}
	} catch (error) {
		console.log(error);
		throw error;
	} finally {
		await session.close();
	}
};
