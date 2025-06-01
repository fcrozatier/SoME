export const wordSegmenter = new Intl.Segmenter("en", { granularity: "word" });

/**
 * Strip non ascii characters
 */
export const NON_ASCII = /\P{ASCII}/gu;
export const NON_ASCII_LETTER = /[^a-z]/gu;
export const NON_WORD = /[^\p{L}\p{M}\p{N}\-]+/gu;

/**
 * Only keep unreserved URL-safe ASCII characters and avoid "." (path traversal safe) / "_" / "~"
 *
 * @see https://datatracker.ietf.org/doc/html/rfc3986#section-2.3
 */
export const NON_ASCII_ALPHANUMERIC_OR_DASH = /[^a-zA-Z0-9\-]/gu;

/**
 * Slugifies an input string
 *
 * Use the {@linkcode NON_ASCII_ALPHANUMERIC_OR_DASH} filter for URL-safe ascii slugs
 *
 * @param input Input string to slugify
 * @param strip The character set to strip from the slug.
 * @default NON_ASCII_ALPHANUMERIC_OR_DASH
 */
export const slugify = (input: string, strip: RegExp = NON_ASCII_ALPHANUMERIC_OR_DASH) => {
	const normalized = input.trim().toLowerCase().normalize("NFKD");
	const words: string[] = [];

	for (const s of wordSegmenter.segment(normalized)) {
		if (s.isWordLike) words.push(s.segment.replaceAll(strip, ""));
		else if (s.segment.length) words.push("-");
	}

	return words.join("-").replaceAll(/-{2,}/g, "-").replaceAll(/^-|-$/g, "").normalize("NFC");
};
