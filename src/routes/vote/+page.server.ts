import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { token } = await parent();
	if (token) {
		throw redirect(303, `/vote/${token}`);
	} else {
		throw redirect(302, `/`);
	}
};
