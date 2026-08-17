import { PUBLIC_RESULTS_AVAILABLE } from "$env/static/public";
import { resultsAvailable } from "./utils/time";

// The competition name
export const FULL_NAME = "Summer of Math Exposition";

export const ANONYMIZED_USER_PREFIX = "deleted-user";

// The different possible categories for entries
// No space as the strings are used in vote url
export const CATEGORIES = ["video", "non-video"] as const;

export type Category = (typeof CATEGORIES)[number];

export const ENTRY_STATE = {
	Active: "active",
	Flagged: "flagged",
	ActionRequired: "action_required",
	WaitingForReview: "waiting_for_review",
	Inactive: "inactive",
} as const;

export type EntryState = (typeof ENTRY_STATE)[keyof typeof ENTRY_STATE];

export const VOTE_STATE = {
	Active: "active",
	Inactive: "inactive",
} as const;

export type VoteState = (typeof VOTE_STATE)[keyof typeof VOTE_STATE];

export const SKIP_STATE = {
	Active: "active",
	Inactive: "inactive",
} as const;

export type SkipState = (typeof SKIP_STATE)[keyof typeof SKIP_STATE];

export const STRIKE_STATE = {
	Open: "open",
	Closed: "closed",
} as const;

export type StrikeState = (typeof ENTRY_STATE)[keyof typeof ENTRY_STATE];

export const CURRENT_YEAR = new Date().getFullYear();

// For the archive
export const defaultYear = () => {
	// If the results are available and we're in the same year as the competition then use the latest data, otherwise use data from last year
	return resultsAvailable() && CURRENT_YEAR === new Date(PUBLIC_RESULTS_AVAILABLE).getFullYear()
		? CURRENT_YEAR
		: CURRENT_YEAR - 1;
};
