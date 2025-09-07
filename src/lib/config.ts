// The competition name
export const FULL_NAME = "Summer of Math Exposition";
export const SHORT_NAME = "SoME";

// The different possible categories for entries
// No space as the strings are used in vote url
export const categories = ["video", "non-video"] as const;
export type Category = (typeof categories)[number];
export const currentYear = new Date().getFullYear();

// For the archive
export const defaultYear = 2024;

/**
 * Formats a list into a string
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

/**
 * The value is the template email subject
 */
export const emailTemplates = {
	"end of peer review": {
		subject: `The ${FULL_NAME} Peer Review is now over!`,
		variables: ["token"],
	},
	"top 100": {
		subject: `Summer of Math Exposition top 100 notification`,
		variables: ["token"],
	},
	token_reminder: {
		subject: `${FULL_NAME} vote is starting soon`,
		variables: ["token"],
	},
	registration: { subject: `Confirm your new password`, variables: ["token"] },
	update: { subject: `How to update your entry`, variables: ["token"] },
	resend_token: {
		subject: `Your link for the ${FULL_NAME}`,
		variables: ["token"],
	},
} as const;

export type TemplateName = keyof typeof emailTemplates;
