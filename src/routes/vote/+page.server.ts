import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { token } = await parent();
	if (token) {
		throw redirect(303, `/vote/${token}`);
	} else {
		throw redirect(302, `/`);
	}
};
