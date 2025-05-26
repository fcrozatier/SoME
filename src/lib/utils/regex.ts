export const YOUTUBE_EMBED = /^https:\/\/youtube\.com\/embed/;
export const YOUTUBE_EMBEDDABLE =
	/youtube\.com\/watch\?.*v=([^&]+)|youtu\.be\/([^?]+)|youtube\.com\/embed\/([^?]+)/;

/**
 * Normalizes youtube links to improve uniqueness and make sure the embed link is correct
 * @param link a Youtube embeddable link
 * @returns the normalized link
 */

export function normalizeYoutubeLink(link: string) {
	const m = link.match(YOUTUBE_EMBEDDABLE);

	const id = m?.[1] || m?.[2] || m?.[3];

	return `https://youtube.com/embed/${id}`;
}
