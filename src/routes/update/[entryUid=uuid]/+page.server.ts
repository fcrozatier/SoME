import { error, fail } from '@sveltejs/kit';
import { normalizeYoutubeLink, phaseOpen, registrationOpen, YOUTUBE_EMBEDDABLE } from '$lib/utils';
import { CreatorSchema, validateForm } from '$lib/server/validation';
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
import { eq, inArray } from 'drizzle-orm';

export const load = async ({ params }) => {
	const entryUid = params.entryUid;

	const entry = (await db.select().from(entries).where(eq(entries.uid, entryUid)))[0];
	console.log('entry:', entry);
	const emails = (
		await db
			.select({ email: usersTable.email })
			.from(usersTable)
			.innerJoin(usersToEntries, eq(usersTable.uid, usersToEntries.userUid))
			.innerJoin(entries, eq(entries.uid, usersToEntries.entryUid))
			.where(eq(entries.uid, entryUid))
	).map((a) => a.email);
	console.log('emails:', emails);

	if (!entry) {
		throw error(
			401,
			'Invalid token: you can use the link you received by email to update your entry'
		);
	}

	return { ...entry, emails };
};

export const actions = {
	default: async ({ request, params }) => {
		const { entryUid } = params;
		console.log('received form');
		if (!phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END)) {
			return fail(422, { invalid: true });
		}

		const validation = await validateForm(request, CreatorSchema);
		console.log('form validation');
		if (!validation.success) {
			console.log('form invalid,', validation.error.flatten());
			return fail(400, validation.error.flatten());
		}

		const emails = [validation.data.email, ...validation.data.others];

		// 1 - Update creators
		const oldUsers = await db
			.select({ email: usersTable.email, uid: usersTable.uid })
			.from(usersTable)
			.innerJoin(usersToEntries, eq(usersTable.uid, usersToEntries.userUid))
			.innerJoin(entries, eq(entries.uid, usersToEntries.entryUid))
			.where(eq(entries.uid, entryUid));
		console.log('old emails:', oldUsers);

		const newCreators = emails.filter((x) => !oldUsers.map((u) => u.email).includes(x));
		const formerCreators = oldUsers.filter((x) => !emails.includes(x.email));

		// Email deliverability validation
		if (!dev) {
			const emailValidation = await Promise.all(
				[...newCreators].map(async (email) => await validateEmail(email))
			);
			if (emailValidation.some((x) => x === null)) {
				return fail(400, { invalid: true });
			}
			const undeliverable = emailValidation.find((x) => x?.result !== 'deliverable');
			if (undeliverable) {
				return fail(400, { undeliverable: undeliverable.address });
			}
		}

		// Detach former creators from entry
		await db.delete(usersToEntries).where(
			inArray(
				usersToEntries.userUid,
				formerCreators.map((u) => u.uid)
			)
		);

		const values: NewUser[] = newCreators.map((u) => {
			return { email: u, type: 'creator', uid: crypto.randomUUID() };
		});

		// Maybe not all new creators of this entry are new users
		const newUsers = await db
			.insert(usersTable)
			.values(values)
			.onConflictDoNothing()
			.returning({ email: usersTable.email, token: usersTable.uid });

		if (!dev) {
			try {
				for (const user of newUsers) {
					await addToMailingList(user.email, user.token);
					await sendEmail(user.email, 'registration', { token: user.token });
				}
			} catch (e) {
				console.error('Cannot send email', e);
			}
		}

		// Grab all real uid of the new creators
		const uids = (
			await db
				.select({ uid: usersTable.uid })
				.from(usersTable)
				.where(inArray(usersTable.email, newCreators))
		).map((u) => u.uid);

		// Attach the new creators to this entry
		await db.insert(usersToEntries).values(uids.map((u) => ({ userUid: u, entryUid })));

		// 2- Update entry

		// Save data
		try {
			if (validation.data.userType === 'creator') {
				if (!registrationOpen()) {
					return fail(422, { invalid: true });
				}
				const { thumbnail, link, ...restData } = validation.data;
				let thumbnailKey = null;
				let normalizedLink = link;
				if (!YOUTUBE_EMBEDDABLE.test(link)) {
					if (!thumbnail) return fail(400, { thumbnailRequired: true });

					thumbnailKey = crypto.randomUUID();
				} else {
					// Normalize youtube links
					normalizedLink = normalizeYoutubeLink(link);
				}

				const params = {
					entryUid: crypto.randomUUID(),
					users,
					link: normalizedLink,
					...restData,
					group: users.length > 1,
					thumbnailKey
				};

				await db.insert(entries).values({
					category: validation.data.category,
					title: validation.data.title,
					url: params.link,
					description: validation.data.description,
					thumbnail: params.thumbnailKey,
					uid: params.entryUid
				});

				// Save thumbnail after the entry: we know it's not a duplicate
				if (!dev && thumbnail && thumbnailKey) {
					console.log('thumbnailKey:', thumbnailKey);
					console.time('thumbnail');
					await saveThumbnail(thumbnail, thumbnailKey);
					console.timeEnd('thumbnail');
				}

				const values: NewUser[] = users.map((u) => {
					return { email: u.email, type: 'creator', uid: u.token };
				});
				console.log('values:', values);

				// Maybe not all users are inserted if they are in other groups
				const insertedUsers = await db
					.insert(usersTable)
					.values(values)
					.onConflictDoNothing()
					.returning({ uid: usersTable.uid });
				console.log('insertedUsers:', insertedUsers);

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

				await db
					.insert(usersToEntries)
					.values(users.map((a) => ({ userUid: a.token, entryUid: params.entryUid })));
			} else {
				console.log('insert judge');
				await db.insert(usersTable).values({
					uid: users[0].token,
					email: users[0].email,
					type: 'judge'
				});
			}

			if (!dev) {
				try {
					for (const user of users) {
						await addToMailingList(user.email, user.token);
						await sendEmail(user.email, 'registration', { token: user.token });
					}
				} catch (e) {
					console.error('Cannot send email', e);
				}
			}
			return {
				success: true,
				user: users.length === 1 ? users[0] : { email: '', token: '' }
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
