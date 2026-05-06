// The competition name
export const FULL_NAME = "Summer of Math Exposition";

// The different possible categories for entries
// No space as the strings are used in vote url
export const categories = ["video", "non-video"] as const;
export type Category = (typeof categories)[number];
export const currentYear = new Date().getFullYear();

// For the archive
export const defaultYear = 2025;

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
