import { db } from '$lib/server/db/client.js';
import type { SelectEntry } from '$lib/server/db/schema.js';
import { resultsAvailable } from '$lib/utils.js';
import { error } from 'console';
import { sql } from 'drizzle-orm';

export const load = async ({ params, locals }) => {
	if (!(resultsAvailable() || locals.isAdmin)) {
		error(400, { message: 'Results not available' });
	}

	const { category } = params;
	const entries: Pick<SelectEntry, 'uid' | 'title' | 'category' | 'thumbnail' | 'url' | 'rank'>[] =
		await db.execute(sql`
		 select uid, title, category, thumbnail, url, rank from entries
		 where active='t'
		 and category=${category}
		 order by rank asc
		`);

	return { entries };
};
