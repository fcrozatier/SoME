import { redirect } from "@sveltejs/kit";

export const load = () => {
	return redirect(302, "/change-password");
};
