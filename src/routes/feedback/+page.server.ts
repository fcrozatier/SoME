import { redirect } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	const uid = locals.user?.uid;
	return uid ? redirect(302, `/feedback/${uid}`) : redirect(302, `/`);
};
