import { uuid } from "$lib/validation";
import type { ParamMatcher } from "@sveltejs/kit";

export const match = ((param) => {
	return uuid(param);
}) satisfies ParamMatcher;
