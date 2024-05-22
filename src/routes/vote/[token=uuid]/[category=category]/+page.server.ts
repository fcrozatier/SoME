import { voteOpen, YOUTUBE_EMBEDDABLE } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { FlagSchema, validateForm, VoteSchema } from '$lib/server/validation';
import { db } from '$lib/server/db/client';
import { entries } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Category } from '$lib/config';

export const load: PageServerLoad = async (event) => {
	const { token, category } = event.params;

	if (!voteOpen()) {
		throw redirect(302, `/vote/${token}`);
	}

	const entry = (
		await db
			.select()
			.from(entries)
			.where(eq(entries.category, category as Category))
			.limit(1)
	)[0];
	console.log('entry:', entry);
	return { entry };
};

let id: 'FLAG' | 'VOTE';

export const actions: Actions = {
	flag: async ({ request, locals }) => {
		id = 'FLAG';

		const validation = await validateForm(request, FlagSchema);
		if (!validation.success) {
			console.log(validation.error.flatten());
			return fail(400, { id, flagFail: true });
		}
	},
	vote: async ({ request, locals, params }) => {
		id = 'VOTE';
		const token = locals.token;
		const { category } = params;

		const validation = await validateForm(request, VoteSchema);
	}
};
