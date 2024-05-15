import { error, fail } from '@sveltejs/kit';
import { normalizeYoutubeLink, phaseOpen, registrationOpen, YOUTUBE_EMBEDDABLE } from '$lib/utils';
import { RegistrationSchema, validateForm } from '$lib/server/validation';
import { addToMailingList, sendEmail, validateEmail } from '$lib/server/email';
import { dev } from '$app/environment';
import { saveThumbnail } from '$lib/server/s3';
import { PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END } from '$env/static/public';
import { db } from '$lib/server/db/client.js';
import {
	entries,
	users as usersTable,
	usersToEntries,
	type NewUser
} from '$lib/server/db/schema.js';
import postgres from 'postgres';
import { postgresErrorCode } from '$lib/server/db/errors.js';
import { inArray } from 'drizzle-orm';

export const load = () => {
	if (!phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END)) {
		throw error(403, 'The registration phase is not open');
	}
};

export const actions = {
	default: async ({ request }) => {
		if (!phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END)) {
			return fail(422, { invalid: true });
		}

		const validation = await validateForm(request, RegistrationSchema);

		if (!validation.success) {
			return fail(400, validation.error.flatten());
		}

		let entryUid = '';
		let users: { token: string; email: string }[] = [
			{ email: validation.data.email, token: crypto.randomUUID() }
		];
		if (validation.data.userType === 'creator') {
			validation.data.others.forEach((x) => users.push({ email: x, token: crypto.randomUUID() }));
		}

		// Email deliverability validation
		if (!dev) {
			const emailValidation = await Promise.all(
				[...users].map(async ({ email }) => await validateEmail(email))
			);
			if (emailValidation.some((x) => x === null)) {
				return fail(400, { invalid: true });
			}
			const undeliverable = emailValidation.find((x) => x?.result !== 'deliverable');
			if (undeliverable) {
				return fail(400, { undeliverable: undeliverable.address });
			}
		}

		// Save data
		try {
			if (validation.data.userType === 'creator') {
				if (!registrationOpen()) {
					return fail(422, { invalid: true });
				}
				const { thumbnail, link } = validation.data;
				let thumbnailKey = null;
				let normalizedLink = link;
				if (!YOUTUBE_EMBEDDABLE.test(link)) {
					if (!thumbnail) return fail(400, { thumbnailRequired: true });

					thumbnailKey = crypto.randomUUID() + '.webp';
				} else {
					// Normalize youtube links
					normalizedLink = normalizeYoutubeLink(link);
				}

				entryUid = crypto.randomUUID();

				await db.insert(entries).values({
					category: validation.data.category,
					title: validation.data.title,
					url: normalizedLink,
					description: validation.data.description,
					thumbnail: thumbnailKey,
					uid: entryUid
				});

				// Save thumbnail after the entry: we know it's not a duplicate
				if (!dev && thumbnail && thumbnailKey) {
					await saveThumbnail(thumbnail, thumbnailKey);
				}

				const values: NewUser[] = users.map((u) => {
					return { email: u.email, uid: u.token };
				});

				// Maybe not all users are inserted if they are in other groups
				await db.insert(usersTable).values(values).onConflictDoNothing();

				// Update all users token with the real uids
				users = await db
					.select({ token: usersTable.uid, email: usersTable.email })
					.from(usersTable)
					.where(
						inArray(
							usersTable.email,
							values.map((v) => v.email)
						)
					);

				await db.insert(usersToEntries).values(users.map((a) => ({ userUid: a.token, entryUid })));
			} else {
				await db.insert(usersTable).values({
					uid: users[0].token,
					email: users[0].email
				});
			}

			if (!dev) {
				try {
					for (const user of users) {
						await addToMailingList(user.email, user.token);
						await sendEmail(user.email, 'registration', { token: user.token });

						if (validation.data.userType === 'creator') {
							await sendEmail(user.email, 'update', { token: entryUid });
						}
					}
				} catch (e) {
					console.error('Cannot send email', e);
				}
			}
			return {
				success: true,
				user: users.length === 1 ? users[0] : { email: '', token: '' },
				entryUid
			};
		} catch (error) {
			console.log('something went wrong', error);
			if (
				error instanceof postgres.PostgresError &&
				error.code === postgresErrorCode.unique_violation
			) {
				console.log(error.message);
				if (error.constraint_name === 'users_email_unique') {
					// Only the judges flow can arrive here as we do not block the creator flow on duplicates emails. Example detail
					// Key (email)=(alice@gmail.com) already exists.
					const match = error.detail?.match(/\(email\)=\((.*)\)/);
					const email = match ? match[1] : '';

					return fail(422, { emailExists: email });
				} else if (error.constraint_name === 'entries_url_unique') {
					return fail(422, { linkExists: true });
				}
			}
			console.log(error);
			return fail(500, { network: true });
		}
	}
};
