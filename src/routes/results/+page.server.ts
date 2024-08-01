import { db } from '$lib/server/db/client.js';
import type { SelectEntry } from '$lib/server/db/schema.js';
import { sql } from 'drizzle-orm';

export const load = async () => {
	const videos: Pick<SelectEntry, 'uid' | 'title' | 'category' | 'rank' | 'thumbnail' | 'url'>[] =
		await db.execute(sql`
		 select uid, title, category, rank, thumbnail, url from entries
		 where active='t'
		 and category='video'
		 order by rank asc
     limit 3
		`);

	const non_videos: Pick<
		SelectEntry,
		'uid' | 'title' | 'category' | 'rank' | 'thumbnail' | 'url'
	>[] = await db.execute(sql`
		 select uid, title, category rank, thumbnail, url from entries
		 where active='t'
		 and category='non-video'
		 order by rank asc
     limit 3
		`);

	return { videos, non_videos };
};
