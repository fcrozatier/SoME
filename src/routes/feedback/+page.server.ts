import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (locals.token) {
		throw redirect(303, `/feedback/${locals.token}`);
	} else {
		throw redirect(302, `/`);
	}
};
