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

/**
 * Returns a number from 0.0 to 1.0 representing how much relative time has elapsed since the beginning of the vote
 */
export function voteTimeElapsedPercent() {
	const end = Temporal.Instant.from(PUBLIC_VOTE_END);
	const start = Temporal.Instant.from(PUBLIC_VOTE_START);
	const now = Temporal.Now.instant();

	return now.since(start).seconds / end.since(start).seconds;
}

const DIVISIONS = [
	{ amount: 60, unit: "second" },
	{ amount: 60, unit: "minute" },
	{ amount: 24, unit: "hour" },
	{ amount: 7, unit: "day" },
	{ amount: 4.34524, unit: "week" },
	{ amount: 12, unit: "month" },
	{ amount: Infinity, unit: "year" },
] as const;

const rtf = new Intl.RelativeTimeFormat("en", {
	numeric: "auto",
});

export function relativeTime(date: string | Date): string {
	let duration = (new Date(date).getTime() - Date.now()) / 1000;

	for (const { amount, unit } of DIVISIONS) {
		if (Math.abs(duration) < amount) {
			return rtf.format(Math.round(duration), unit);
		}
		duration /= amount;
	}

	// Unreachable because of Infinity
	return "";
}
