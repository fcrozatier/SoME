import { voteOpen } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { FlagSchema, validateForm, VoteSchema } from '$lib/server/validation';

export const load: PageServerLoad = async (event) => {
	const { token } = event.params;
	if (!token) {
		throw redirect(302, `/vote/`);
	}
	if (!voteOpen()) {
		throw redirect(302, `/vote/${token}`);
	}
	const { category } = event.params;
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
