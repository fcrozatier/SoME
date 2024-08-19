import { redirect } from '@sveltejs/kit';

export const load = async ({ parent }) => {
	const { token } = await parent();
	if (token) {
		redirect(303, `/vote/${token}`);
	} else {
		redirect(302, `/`);
	}
};
