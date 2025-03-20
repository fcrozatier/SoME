import { read } from "$app/server";
import { json } from "@sveltejs/kit";

export const GET = () => {
	return json([{
		"user_agent": "prefetch-proxy",
		"fraction": 1.0,
	}], {
		headers: {
			"Content-Type": "application/trafficadvice+json",
		},
	});
};
