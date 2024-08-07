import { db } from '$lib/server/db/client';
import { entries } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { videos as v2021 } from './2021_videos';
import { videos as v2022 } from './2022_videos';
import { videos as v2023 } from './2023_videos';

const data = {
	'2023': v2023,
	'2022': v2022,
	'2021': v2021,
};

export const actions = {
	default: async ({ request }) => {
		const year = (await request.formData()).get('year')?.toString();
		if (!year) return fail(400);
		const videos = data[year as keyof typeof data];

		for (let i = 0; i < videos.length; i++) {
			await db.insert(entries).values({
				category: 'video',
				title: videos[i].title,
				url: videos[i].href,
				rank: i + 1,
				description: '',
				uid: crypto.randomUUID(),
				createdAt: `${year}-06-01`,
			});
		}
		console.log(`added ${year} videos`);
	},
};
