/**
 * Formats page title
 */
export const formatTitle = (title: string) => `${title} | SoME`;

/**
 * Formats a list of words into a string
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
