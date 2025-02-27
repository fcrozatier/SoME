import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (locals.token) {
		redirect(303, `/feedback/${locals.token}`);
	} else {
		redirect(302, `/`);
	}
};
