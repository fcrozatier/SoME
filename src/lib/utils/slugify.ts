export const wordSegmenter = new Intl.Segmenter("en", { granularity: "word" });

/**
 * Strip non ascii characters
 */
export const NON_ASCII = /\P{ASCII}/gu;
export const NON_ASCII_LETTER = /[^a-z]/gu;
export const NON_WORD = /[^\p{L}\p{M}\p{N}\-]+/gu;

/**
 * Slugifies an input string
 *
 * @param input Input string to slugify
 * @param strip The character set to strip from the slug.
 * @default NON_ASCII
 */
export const slugify = (input: string, strip: RegExp = NON_ASCII) => {
	const normalized = input.trim().toLowerCase().normalize("NFKD");
	const words: string[] = [];

	for (const s of wordSegmenter.segment(normalized)) {
		if (s.isWordLike) words.push(s.segment.replaceAll(strip, ""));
		else if (s.segment.length) words.push("-");
	}

	return words.join("-")
		.replaceAll(/-{2,}/g, "-")
		.replaceAll(/^-|-$/g, "")
		.normalize("NFC");
};
