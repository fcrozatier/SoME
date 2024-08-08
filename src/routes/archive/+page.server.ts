import { db } from '$lib/server/db/client.js';
import type { SelectEntry } from '$lib/server/db/schema.js';
import { sql } from 'drizzle-orm';

export const load = async ({ url }) => {
	let year = url.searchParams.get('year');
	let category = url.searchParams.get('category');
	let page = url.searchParams.get('page');
	const limit = 50;

	if (!year) {
		url.searchParams.set('year', '2023');
		year = '2023';
	}

	if (!category) {
		url.searchParams.set('category', 'video');
		category = 'video';
	}

	if (!page) {
		url.searchParams.set('page', '1');
		page = '1';
	}

	const entries: Pick<SelectEntry, 'uid' | 'title' | 'category' | 'thumbnail' | 'url' | 'rank'>[] =
		await db.execute(sql`
		 select uid, title, category, thumbnail, url, rank from entries
		 where date_part('year', entries.created_at)=${year}
		 and category=${category}
		 order by rank asc nulls last
     limit ${limit}
     offset ${(+page - 1) * limit}
		`);

	const total = (
		await db.execute(sql`
		 select count(*) from entries
		 where date_part('year', entries.created_at)=${year}
		 and category=${category}
		`)
	)[0] as { count: number };

	return { entries, pages: Math.ceil(total.count / 50) };
};
