import { currentYear } from "$lib/config.js";
import { redirect } from "@sveltejs/kit";

export const load = async ({ request }) => {
	console.log("[LEGACY]: non-videos -> archive", request.referrer);
	return redirect(301, `/archive?category=non-video&year=${currentYear - 1}&page=1`);
};
