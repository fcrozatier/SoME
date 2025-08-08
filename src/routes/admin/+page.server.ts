import { error } from "@sveltejs/kit";

export const load = async ({ locals }) => {
	if (!locals.user?.isAdmin) {
		return error(404);
	}
};
