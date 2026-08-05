import { CATEGORIES } from "$lib/constants";
import type { ParamMatcher } from "@sveltejs/kit";

export const match = ((param) => {
	return CATEGORIES.includes(param as any);
}) satisfies ParamMatcher;
