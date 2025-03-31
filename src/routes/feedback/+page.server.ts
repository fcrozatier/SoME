import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	const uid = locals.user?.uid;
	if (uid) {
		redirect(302, `/feedback/${uid}`);
	} else {
		redirect(302, `/`);
	}
};
