import { db } from '$lib/server/db/client';
import { type SelectEntry } from '$lib/server/db/schema';
import { fail } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';

export const load = async () => {
	const entries: Pick<SelectEntry, 'uid' | 'title'>[] = await db.execute(sql`
			select uid, title
			from entries
			where entries.active='true'
			and date_part('year', entries.created_at)='2024'
			order by created_at
			limit all
			offset 0;
		`);

	return { entries };
};

export const actions = {
	display: async ({ request }) => {
		const uid = (await request.formData()).get('uid')?.toString();

		if (!uid) return fail(400);

		const entry: Pick<
			SelectEntry,
			'uid' | 'title' | 'url' | 'description' | 'category' | 'thumbnail'
		>[] = await db.execute(sql`
			select uid, title, url, description, category, thumbnail
			from entries where uid=${uid}
			`);

		return { success: true, entry: entry[0] };
	},
};
