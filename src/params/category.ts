import { categories } from "$lib/config";
import type { ParamMatcher } from "@sveltejs/kit";

export const match = ((param) => {
	return categories.includes(param as typeof categories[number]);
}) satisfies ParamMatcher;
