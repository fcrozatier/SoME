import {
	PUBLIC_REGISTRATION_END,
	PUBLIC_REGISTRATION_START,
	PUBLIC_RESULTS_AVAILABLE,
	PUBLIC_VOTE_END,
	PUBLIC_VOTE_START,
} from "$env/static/public";

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
	try {
		// Compare dates using UTC projection
		const now = Temporal.Now.zonedDateTimeISO("UTC");
		const then = Temporal.Instant.from(PUBLIC_REGISTRATION_END).toZonedDateTimeISO("UTC");

		const {
			days: d,
			hours,
			minutes,
			seconds,
		} = now.until(then, {
			smallestUnit: "seconds",
			largestUnit: "days",
			roundingMode: "trunc",
		});

		const days = d > 0 ? d + ` day${d > 1 ? "s" : ""} ` : "";
		return `${days}${hours}h ${padStartZero(minutes)}min ${padStartZero(seconds)}s`;
	} catch (e) {
		if (!(e instanceof ReferenceError)) throw e;

		// Temporal API not available
		const ms = Date.parse(PUBLIC_REGISTRATION_END) - Date.now();
		const d = Math.floor(ms / (1000 * 60 * 60 * 24));
		const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const min = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
		const sec = Math.floor((ms % (1000 * 60)) / 1000);

		const days = d > 0 ? d + ` day${d > 1 ? "s" : ""} ` : "";
		return `${days}${h}h ${padStartZero(min)}min ${padStartZero(sec)}s`;
	}
}
