import { dev } from "$app/environment";
import { DOMAIN, MAILGUN_API_KEY } from "$env/static/private";
import { formatDateTime } from "$lib/utils/formatting";
import formData from "form-data";
import Mailgun from "mailgun.js";

/**
 * https://github.com/mailgun/mailgun.js
 */
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: "api", key: MAILGUN_API_KEY });

const FROM = "SoME <some@3blue1brown.com>";
const GENERIC_TEMPLATE = "generic-template";

// https://documentation.mailgun.com/en/latest/api-email-validation.html
type Validation = {
	address: string;
	did_you_mean?: string;
	is_disposable_address: boolean;
	is_role_address: boolean;
	reason: string[];
	result: "deliverable" | "undeliverable" | "do_not_send" | "catch_all" | "unknown";
	risk: "high" | "medium" | "low" | "unknown";
	root_address?: string;
};

export const validateEmail = async (email: string) => {
	try {
		return (await mg.validate.get(email)) as Validation; // improves default types
	} catch (error) {
		return null;
	}
};

export async function addToMailingList(email: string, token: string) {
	await mg.lists.members.createMember(`newsletter@${DOMAIN}`, {
		address: email,
		subscribed: "yes",
		vars: JSON.stringify({ token }),
		upsert: "yes", // update recipient if already subscribed
	});
}

export async function sendGenericTemplateEmail({
	to,
	data: { subject, body },
}: {
	to: string | string[];
	data: EmailData;
}) {
	if (dev) {
		console.log("[message received]");
		console.log("from:", FROM);
		console.log("to:", to);
		console.log("subject:", subject);
		console.log("body:", body);
		return;
	}

	return await mg.messages.create(DOMAIN, {
		from: FROM,
		to,
		subject,
		template: GENERIC_TEMPLATE,
		"t:variables": JSON.stringify({
			body,
		}),
	});
}

export const EMAILS = {
	ChangePassword: ({ token }: { token: string }) => ({
		subject: "Confirm your password reset",
		body: `<h1>One last step</h1>
			<p>You've updated your password. For this change to take effect, please visit the following url:<br>
			<a href="https://some.3b1b.co/change-password/${token}">https://some.3b1b.co/change-password/${token}</a>
			</p>
			`,
	}),
	ActionRequired: ({ entryTitle, deadline }: { entryTitle: string; deadline: string }) => ({
		subject: "[action required] Entry flagged. Please update your entry",
		body: `<p>Your entry <em>"${entryTitle}"</em> was flagged by admins and is temporarily inactive.</p>
		<p>Please go to <a href="https://some.3b1b.co/user/entries">"My Entries"</a> to see why and update your entry to resolve the issue <strong>before ${formatDateTime(
			deadline,
			{ includeTime: false },
		)}</strong>.</p>
		<p>Thanks</p>
		`,
	}),
	StrikeResolved: ({ entryTitle }: { entryTitle: string }) => ({
		subject: "[issue resolved] Entry unflagged",
		body: `<p>The flag on your entry <em>"${entryTitle}"</em> was removed by admins. You don't have anything else to do.</p>
			<p>Thank you</p>
		`,
	}),
	EntryInactive: ({ entryTitle }: { entryTitle: string }) => ({
		subject: "[ongoing issue] Entry disabled",
		body: `<p>Your entry <em>"${entryTitle}"</em> was disabled by admins and has been removed from the competition.</p>
		`,
	}),
} as const satisfies Record<string, EmailData | ((...params: any[]) => EmailData)>;

type EmailData = { subject: string; body: string };
