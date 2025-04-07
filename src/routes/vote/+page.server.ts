import { redirect } from "@sveltejs/kit";

export const load = async ({ parent }) => {
	const { user } = await parent();
	return user?.uid ? redirect(302, `/vote/${user?.uid}`) : redirect(302, `/`);
};
