import { redirect } from "@sveltejs/kit";

export const load = ({ request }) => {
	console.log("[LEGACY] register -> signup", request.referrer);
	return redirect(301, "/signup");
};
