import {
	PUBLIC_REGISTRATION_END,
	PUBLIC_REGISTRATION_START,
	PUBLIC_RESULTS_AVAILABLE,
	PUBLIC_VOTE_END,
	PUBLIC_VOTE_START
} from '$env/static/public';

export function competitionStarted() {
	if (!PUBLIC_REGISTRATION_START) return false;
	const now = new Date();
	const start = new Date(PUBLIC_REGISTRATION_START);
	return now > start;
}

export function phaseOpen(startDate: string, endDate: string) {
	if (!startDate || !endDate) return false;

	const now = new Date();
	const openingDate = new Date(startDate);
	const closingDate = new Date(endDate);

	return now > openingDate && now < closingDate;
}

export function registrationOpen() {
	return phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_REGISTRATION_END);
}

export function voteOpen() {
	return phaseOpen(PUBLIC_VOTE_START, PUBLIC_VOTE_END);
}

export function resultsAvailable() {
	return new Date() > new Date(PUBLIC_RESULTS_AVAILABLE);
}

export const YOUTUBE_EMBEDDABLE = /youtube\.com\/watch\?.*v=([^&]*)|youtu\.be\/([^&]*)/;

/**
 * Normalizes youtube links to improve uniqueness
 * @param link a Youtube embeddable link
 * @returns the normalized link in the form youtube.com/watch?v=...
 */
export function normalizeYoutubeLink(link: string) {
	const m = link.match(YOUTUBE_EMBEDDABLE);

	const id = m?.[1] || m?.[2];

	return `https://youtube.com/watch?v=${id}`;
}

/**
 * Randomly shuffles a tuple
 * @param tuple
 */
export function shuffleTuple<T>(tuple: T[]) {
	if (!tuple || tuple.length !== 2) {
		return tuple;
	}

	const [a, b] = tuple;
	if (Math.random() < 0.5) {
		return tuple;
	}
	return [b, a];
}
