// The competition name
export const COMPETITION_FULL_NAME = 'Summer of Math Exposition';
export const COMPETITION_SHORT_NAME = 'SoME';

export const BETA_TEST = false;

// The different possible categories for entries
// No space as the strings are used in vote url
export const categories = ['video', 'non-video'] as const;
export type Category = (typeof categories)[number];

export const userTypes = ['creator', 'judge'] as const;

export const listFormatter = new Intl.ListFormat('en', { type: 'disjunction', style: 'short' });

/**
 * Batch sending templates only
 */
export const templateNames = ['token_reminder', 'end of peer review', 'top 100'] as const;

/**
 * The value is the template email subject
 */
export const emailTemplates = {
	'end of peer review': {
		subject: `The ${COMPETITION_FULL_NAME} Peer Review is now over!`,
		variables: ['token']
	},
	'top 100': {
		subject: `Summer of Math Exposition top 100 notification`,
		variables: ['token']
	},
	token_reminder: {
		subject: `${COMPETITION_FULL_NAME} vote is starting soon`,
		variables: ['token']
	},
	registration: { subject: `${COMPETITION_FULL_NAME} registration`, variables: ['token'] },
	resend_token: { subject: `Your link for the ${COMPETITION_FULL_NAME}`, variables: ['token'] }
} as const;

export type TemplateName = keyof typeof emailTemplates;
