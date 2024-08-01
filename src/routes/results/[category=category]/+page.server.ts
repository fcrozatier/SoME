import { db } from '$lib/server/db/client.js';
import type { SelectEntry } from '$lib/server/db/schema.js';
import { sql } from 'drizzle-orm';

export const load = async ({ params }) => {
	const { category } = params;
	const entries: Pick<SelectEntry, 'uid' | 'title' | 'rank'>[] = await db.execute(sql`
		 select uid, title, rank from entries
		 where active='t'
		 and category=${category}
		 order by rank asc
		`);

	return { entries };
};
