import { redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
	const { user } = await parent();
	if (user?.uid) {
		redirect(302, `/vote/${user?.uid}`);
	} else {
		redirect(302, `/`);
	}
};
