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

export function formatDateTime(
	datetime: string,
	options?: (Intl.DateTimeFormatOptions & { includeTime?: boolean }) | undefined,
) {
	const includeTime = options?.includeTime ?? true;

	return new Intl.DateTimeFormat(
		navigator.language,
		options ?? {
			// weekday: 'long',
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: includeTime ? "numeric" : undefined,
			minute: includeTime ? "numeric" : undefined,
		},
	).format(Date.parse(datetime));
}
