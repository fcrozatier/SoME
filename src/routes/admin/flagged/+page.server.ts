import { db } from '$lib/server/db/client';
import { flags } from '$lib/server/db/schema';
import { FlagForm, validateForm } from '$lib/server/validation';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		// Get flagged entries
		const res = await db.select().from(flags).orderBy(flags.entryUid).offset(0).limit(100);

		const flagged = [];
		for (const row of res.records) {
			const entry = row.get('n');
			const reason = row.get('reason');
			const email = row.get('email');
			const creators = row.get('creators');
			flagged.push({
				link: entry.properties.link,
				title: entry.properties.title,
				reason,
				email,
				creators,
			});
		}

		return { flagged };
	} catch (error) {
		return { error: true };
	}
};

export const actions: Actions = {
	ignore: async ({ request }) => {
		const validation = await validateForm(request, FlagForm);
		if (!validation.success) {
			return fail(400, { unflagError: true });
		}

		const session = driver.session();

		try {
			await session.executeWrite((tx) => {
				return tx.run(
					`
					UNWIND $selection AS selection
					MATCH (n:Entry)<-[f:FLAG]-(u:User)
					WHERE n.link = selection.link AND u.email = selection.email
					DELETE f
		  `,
					{ selection: validation.data.selection },
				);
			});
			return { unflag: true };
		} catch (error) {
			return fail(400, { unflagError: true });
		} finally {
			await session.close();
		}
	},
	remove: async ({ request }) => {
		const validation = await validateForm(request, FlagForm);
		if (!validation.success) {
			return fail(400, { unflagError: true });
		}

		const session = driver.session();

		try {
			await session.executeWrite((tx) => {
				return tx.run(
					`
					UNWIND $selection AS selection
						MATCH (n:Entry)
						WHERE n.link = selection.link
						OPTIONAL MATCH (n)-[:FEEDBACK]->(f:Feedback)
						SET n.flagged = true
					`,
					{ selection: validation.data.selection },
				);
			});
			return { flag: true };
		} catch (error) {
			return fail(400, { flagError: true });
		} finally {
			await session.close();
		}
	},
};
