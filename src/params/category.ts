import { CATEGORIES } from "$lib/config";
import type { ParamMatcher } from "@sveltejs/kit";

export const match = ((param) => {
	return CATEGORIES.includes(param as any);
}) satisfies ParamMatcher;
