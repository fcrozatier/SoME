import { db } from '$lib/server/db/client';
import { entries } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { non_videos as n2021 } from './2021_non_videos';
import { videos as v2021 } from './2021_videos';
import { non_videos as n2022 } from './2022_non_videos';
import { videos as v2022 } from './2022_videos';
import { videos as v2023 } from './2023_videos';

const data = {
	v2023: v2023,
	v2022: v2022,
	v2021: v2021,
	n2021: n2021,
	n2022: n2022,
};

export const actions = {
	default: async ({ request }) => {
		const type = (await request.formData()).get('type')?.toString();
		if (!type) return fail(400);
		const category = type[0] === 'v' ? 'video' : 'non-video';
		const year = type.slice(1);

		const all = data[type as keyof typeof data];

		for (let i = 0; i < all.length; i++) {
			await db.insert(entries).values({
				category,
				title: all[i]?.title ?? '',
				url: all[i].url,
				rank: i + 1,
				description: '',
				uid: crypto.randomUUID(),
				createdAt: `${year}-06-01`,
			});
		}
		console.log(`added ${year} ${category}s`);
	},
};
