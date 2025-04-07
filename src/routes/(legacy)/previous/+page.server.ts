import { redirect } from "@sveltejs/kit";

export const load = ({ request }) => {
	console.log("[LEGACY] previous -> archive", request.referrer);
	redirect(301, "/archive");
};
