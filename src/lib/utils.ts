import { browser } from "$app/environment";
import {
	PUBLIC_REGISTRATION_END,
	PUBLIC_REGISTRATION_START,
	PUBLIC_RESULTS_AVAILABLE,
	PUBLIC_VOTE_END,
	PUBLIC_VOTE_START,
} from "$env/static/public";
import { SHORT_NAME } from "./config";

export const setTitle = (title: string) => {
	if (browser) {
		document.title = `${title} – ${SHORT_NAME}`;
	}
};

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

export function submissionsOpen() {
	return phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_REGISTRATION_END);
}

export function voteOpen() {
	return phaseOpen(PUBLIC_VOTE_START, PUBLIC_VOTE_END);
}

export function resultsAvailable() {
	return new Date() > new Date(PUBLIC_RESULTS_AVAILABLE);
}

export const YOUTUBE_EMBEDDABLE =
	/youtube\.com\/watch\?.*v=([^&]+)|youtu\.be\/([^?]+)|youtube\.com\/embed\/([^?]+)/;

export const YOUTUBE_EMBED = /^https:\/\/youtube\.com\/embed/;

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

/**
 * Pads a number with a leading zero if needed to ensure it is two characters long
 */
const padStartZero = (number: number) => {
	return String(number).padStart(2, "0");
};

/**
 * Remaining time to submit an entry
 */
export function timeLeft() {
	const ms = Date.parse(PUBLIC_REGISTRATION_END) - Date.now();
	const d = Math.floor(ms / (1000 * 60 * 60 * 24));
	const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
	const sec = Math.floor((ms % (1000 * 60)) / 1000);

	const days = `${d > 0 ? d.toString() + ` day${d > 1 ? "s" : ""} ` : ""}`;
	return {
		ms,
		formatted: `${days}${h}h ${padStartZero(min)}min ${padStartZero(sec)}s`,
	};
}

const wordSegmenter = new Intl.Segmenter("en", { granularity: "word" });

/**
 * Strip non ascii characters
 */
const NON_ASCII = /\P{ASCII}/gu;

/**
 * Slugifies an input string
 *
 * @param input Input string to slugify
 * @param strip The character set to strip from the slug. By default non ascii characters are stripped out
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
