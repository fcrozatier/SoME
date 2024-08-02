import { db } from '$lib/server/db/client.js';
import type { SelectEntry } from '$lib/server/db/schema.js';
import { resultsAvailable } from '$lib/utils';
import { error } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

export const load = async ({ locals }) => {
	if (!(resultsAvailable() || locals.isAdmin)) {
		error(400, { message: 'Results not available' });
	}

	const top: Pick<
		SelectEntry,
		'uid' | 'title' | 'description' | 'category' | 'rank' | 'thumbnail' | 'url'
	>[] = await db.execute(sql`
		 select uid, title, description, category, rank, thumbnail, url from entries
		 where active='t'
		 order by rank asc
     limit 25
		`);

	return { top };
};
