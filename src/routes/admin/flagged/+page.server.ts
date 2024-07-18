import { db } from '$lib/server/db/client';
import { type SelectEntry, type SelectFlag } from '$lib/server/db/schema';
import { FlagForm, validateForm } from '$lib/server/validation';
import { fail, type Actions } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const flagged: (Pick<SelectEntry, 'uid' | 'title' | 'url'> & Pick<SelectFlag, 'reason'>)[] =
		await db.execute(sql`
			select uid, title, url, reason
			from entries join flags
			on uid=entry_uid
			where "entries".active='true'
			order by uid
			limit all
			offset 0;
		`);

	return { flagged };
};

export const actions: Actions = {
	ignore: async ({ request }) => {
		const validation = await validateForm(request, FlagForm);

		if (!validation.success) {
			return fail(400, { ignoreError: true });
		}

		try {
			await db.execute(sql`
				delete from flags where entry_uid in ${validation.data.selection};
			`);

			return { success: true };
		} catch (error) {
			return fail(400, { ignoreError: true });
		}
	},
	deactivate: async ({ request }) => {
		const validation = await validateForm(request, FlagForm);

		if (!validation.success) {
			return fail(400, { unflagError: true });
		}

		try {
			await db.execute(sql`
				update entries set active='false' where uid in ${validation.data.selection};
			`);

			return { flag: true };
		} catch (error) {
			return fail(400, { flagError: true });
		}
	},
};
