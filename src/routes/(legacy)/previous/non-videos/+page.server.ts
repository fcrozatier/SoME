import { redirect } from "@sveltejs/kit";

export const load = ({ request }) => {
	console.log("[LEGACY] previous/non-videos -> archive", request.referrer);
	return redirect(301, "/archive");
};
