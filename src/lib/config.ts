import { PUBLIC_RESULTS_AVAILABLE } from "$env/static/public";
import { resultsAvailable } from "./utils/time";

// The competition name
export const FULL_NAME = "Summer of Math Exposition";

// The different possible categories for entries
// No space as the strings are used in vote url
export const categories = ["video", "non-video"] as const;
export type Category = (typeof categories)[number];
export const currentYear = new Date().getFullYear();

// For the archive
export const defaultYear = () => {
	// If the results are available and we're in the same year as the competition then use the latest data, otherwise use data from last year
	return resultsAvailable() &&
			currentYear === new Date(PUBLIC_RESULTS_AVAILABLE).getFullYear()
		? currentYear
		: currentYear - 1;
};

/**
 * Formats a list into a string
 *
 * @example
 *
 * ```ts
 * conjunctionFormatter.format(list)
 * ```
 */
export const conjunctionFormatter = new Intl.ListFormat("en", {
	style: "long",
	type: "conjunction",
});
