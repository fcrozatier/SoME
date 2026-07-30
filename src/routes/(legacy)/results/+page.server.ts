import { redirect } from "@sveltejs/kit";

export const load = ({ request }) => {
	console.log("[LEGACY] results -> archive", request.referrer);
	return redirect(301, `/archive`);
};
