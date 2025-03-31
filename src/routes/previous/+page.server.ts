import { redirect } from "@sveltejs/kit";

export const load = ({ request }) => {
	console.log("REDIRECTING previous -> archive", request.referrer);
	redirect(301, "/archive");
};
