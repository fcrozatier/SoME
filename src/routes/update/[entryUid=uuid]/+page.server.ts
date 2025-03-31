import { dev } from "$app/environment";
import { PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END } from "$env/static/public";
import { db } from "$lib/server/db";
import { postgresErrorCode } from "$lib/server/db/postgres_errors.js";
import {
	entries,
	users as usersTable,
	usersToEntries,
	votes,
	type InsertUser,
} from "$lib/server/db/schema.js";
import { addToMailingList, sendEmail, validateEmail } from "$lib/server/email";
import { saveThumbnail } from "$lib/server/s3";
import { CreatorSchema, validateForm } from "$lib/validation";
import { normalizeYoutubeLink, phaseOpen, registrationOpen, YOUTUBE_EMBEDDABLE } from "$lib/utils";
import { error, fail } from "@sveltejs/kit";
import { and, eq, inArray } from "drizzle-orm";
import postgres from "postgres";

export const load = async ({ params, locals }) => {
	if (!locals.user?.isAdmin) {
		return error(400, { message: "The competition is closed" });
	}

	const entryUid = params.entryUid;

	const entry = (await db.select().from(entries).where(eq(entries.uid, entryUid)))[0];
	console.log("entry:", entry);
	const emails = (
		await db
			.select({ email: usersTable.email })
			.from(usersTable)
			.innerJoin(usersToEntries, eq(usersTable.uid, usersToEntries.userUid))
			.innerJoin(entries, eq(entries.uid, usersToEntries.entryUid))
			.where(eq(entries.uid, entryUid))
	).map((a) => a.email);
	console.log("emails:", emails);

	if (!entry) {
		throw error(
			401,
			"Invalid token: you can use the link you received by email to update your entry",
		);
	}

	return { ...entry, emails };
};

export const actions = {
	default: async ({ request, params }) => {
		try {
			const { entryUid } = params;
			console.log("received form");
			if (!phaseOpen(PUBLIC_REGISTRATION_START, PUBLIC_VOTE_END)) {
				return fail(422, { message: "The competition is closed" });
			}

			const validation = await validateForm(request, CreatorSchema);

			if (!validation.success) {
				console.log("form invalid,", validation.error.flatten());
				return fail(400, validation.error.flatten());
			}

			const emails = [validation.data.email, ...validation.data.others];

			// 1 - Update creators
			const oldData = await db
				.select({ email: usersTable.email, uid: usersTable.uid })
				.from(usersTable)
				.innerJoin(usersToEntries, eq(usersTable.uid, usersToEntries.userUid))
				.innerJoin(entries, eq(entries.uid, usersToEntries.entryUid))
				.where(eq(entries.uid, entryUid));
			console.log("old emails:", oldData);

			const newCreators = emails.filter((x) => !oldData.map((u) => u.email).includes(x));
			const formerCreators = oldData.filter((x) => !emails.includes(x.email));

			// Email deliverability validation
			if (!dev) {
				const emailValidation = await Promise.all(
					[...newCreators].map(async (email) => await validateEmail(email)),
				);
				if (emailValidation.some((x) => x === null)) {
					return fail(400, { message: "There is something wrong with the emails" });
				}
				const undeliverable = emailValidation.find((x) => x?.result !== "deliverable");
				if (undeliverable) {
					return fail(400, {
						undeliverable: undeliverable.address,
					});
				}
			}

			// Detach former creators from entry
			if (formerCreators.length > 0) {
				await db.delete(usersToEntries).where(
					and(
						inArray(
							usersToEntries.userUid,
							formerCreators.map((u) => u.uid),
						),
						eq(usersToEntries.entryUid, entryUid),
					),
				);
			}

			if (newCreators.length > 0) {
				const values: InsertUser[] = newCreators.map((u) => {
					return { email: u, uid: crypto.randomUUID() };
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
							await sendEmail(user.email, "registration", { token: user.token });
						}
					} catch (e) {
						console.error("Cannot send email", e);
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
			}

			// 2- Update entry

			const { oldThumbnail, oldUrl } = (
				await db
					.select({ oldThumbnail: entries.thumbnail, oldUrl: entries.url })
					.from(entries)
					.where(eq(entries.uid, entryUid))
					.limit(1)
			)[0];

			const { thumbnail, link } = validation.data;
			let normalizedLink = link;
			let thumbnailKey = oldThumbnail;

			if (!YOUTUBE_EMBEDDABLE.test(link)) {
				if (!thumbnail && !oldThumbnail) return fail(400, { thumbnailRequired: true });
				if (thumbnail && !oldThumbnail) thumbnailKey = crypto.randomUUID() + ".webp";
			} else {
				// Normalize youtube links
				normalizedLink = normalizeYoutubeLink(link);
			}

			if (oldUrl !== normalizedLink) {
				if (!registrationOpen())
					return fail(422, { message: "You can't update the link once the vote is open" });
				// Remove all votes in case the link was changed
				await db.delete(votes).where(eq(votes.entryUid, entryUid));
			}

			await db
				.update(entries)
				.set({
					category: validation.data.category,
					description: validation.data.description,
					title: validation.data.title,
					url: normalizedLink,
					thumbnail: thumbnailKey,
				})
				.where(eq(entries.uid, entryUid));

			// Save thumbnail after the entry: we know it's not a duplicate
			if (thumbnail && thumbnailKey) {
				await saveThumbnail(thumbnail, thumbnailKey);
			}

			return {
				success: true,
			};
		} catch (error) {
			console.log("something went wrong", error);
			if (
				error instanceof postgres.PostgresError &&
				error.code === postgresErrorCode.unique_violation
			) {
				console.log(error.message);
				if (error.constraint_name === "entries_url_unique") {
					return fail(422, { linkExists: true });
				}
			}
			console.log(error);
			return fail(500, { message: "Network error" });
		}
	},
};
