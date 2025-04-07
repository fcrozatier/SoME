import { redirect } from "@sveltejs/kit";

export const load = async ({ request }) => {
	console.log("REDIRECTING non-videos -> archive", request.referrer);
	redirect(301, "/archive?category=non-video&year=2023&page=1");
};
