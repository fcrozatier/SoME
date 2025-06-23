import { currentYear } from "$lib/config.js";
import { redirect } from "@sveltejs/kit";

export const load = ({ request }) => {
	console.log("[LEGACY] results -> archive", request.referrer);
	return redirect(
		301,
		`/archive?category=video&year=${currentYear - 1}&page=1`,
	);
};
