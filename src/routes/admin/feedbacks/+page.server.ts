import type { Actions } from './$types';
import { driver, type Feedback } from '$lib/server/neo4j';
import { toNativeTypes } from '$lib/utils';
import { fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { FeedbackForm, validateForm } from '$lib/server/validation';

export const load: PageServerLoad = async () => {
	const session = driver.session();

	try {
		// Get feedbacks
		const res = await session.executeRead((tx) => {
			return tx.run<{ f: Feedback }>(
				`
				MATCH (f:Feedback)
				WHERE f.validated IS NULL
				AND f.explicit = true
				RETURN f LIMIT 25
      `
			);
		});

		const feedbacks = [];
		for (const row of res.records) {
			const entry = row.get('f');
			feedbacks.push(toNativeTypes(entry.properties));
		}

		return {
			feedbacks
		};
	} catch (error) {
		return { success: false };
	} finally {
		await session.close();
	}
};

export const actions: Actions = {
	ignore: async ({ request }) => {
		const validation = await validateForm(request, FeedbackForm);
		if (!validation.success) {
			return fail(400, { error: true });
		}

		const session = driver.session();

		try {
			await session.executeWrite((tx) => {
				return tx.run(
					`
					UNWIND $selection as token
					MATCH (f:Feedback)
					WHERE f.token = token
					SET f.validated = True
      `,
					{ selection: validation.data.selection }
				);
			});
			return { success: true };
		} catch (error) {
			return fail(400, { error: true });
		} finally {
			await session.close();
		}
	},
	remove: async ({ request }) => {
		const validation = await validateForm(request, FeedbackForm);
		if (!validation.success) {
			return fail(400, { error: true });
		}
		const session = driver.session();

		try {
			await session.executeWrite((tx) => {
				return tx.run(
					`
					UNWIND $selection as token
					MATCH (f:Feedback)
					WHERE f.token = token
					DETACH DELETE f
      `,
					{ selection: validation.data.selection }
				);
			});
			return { success: true };
		} catch (error) {
			return fail(400, { error: true });
		} finally {
			await session.close();
		}
	}
};
