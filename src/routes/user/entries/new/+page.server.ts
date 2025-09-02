import { conjunctionFormatter } from "$lib/config.js";
import { db } from "$lib/server/db";
import { postgresErrorCode } from "$lib/server/db/postgres_errors.js";
import { entries, entryToTag, nonTags, tags, users, userToEntry } from "$lib/server/db/schema.js";
import { saveThumbnail } from "$lib/server/s3";
import { dictionary } from "$lib/utils/dictionary.server.js";
import { normalizeYoutubeLink, YOUTUBE_EMBEDDABLE } from "$lib/utils/regex";
import { slugify } from "$lib/utils/slugify.js";
import { submissionsOpen } from "$lib/utils/time.js";
import { invalidTagsMessage, levels, NewEntrySchema } from "$lib/validation";
import { error, redirect } from "@sveltejs/kit";
import { inArray } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";
import postgres from "postgres";

export const load = async ({ locals }) => {
	const { user } = locals;
	if (!user?.uid) {
		throw redirect(302, "/login");
	}

	if (!submissionsOpen() && !user.isAdmin) {
		throw error(403, "Submissions are closed");
	}
};

export const actions = {
	default: formgate(NewEntrySchema, async (data, { locals, fetch }) => {
		if (!locals.user) {
			throw error(401, "You must be logged in");
		}

		if (!locals.user.username) {
			throw error(401, "Please choose a username on your Profile page before submitting");
		}

		if (!submissionsOpen() && !locals.user.isAdmin) {
			throw error(403, "Submissions are closed");
		}

		// Validate youtube entries creation date and channel identity
		const id = data.url.match(YOUTUBE_EMBEDDABLE)?.groups?.id;
		// if (id) await validateYtCreationDate(id);

		const usernames = [...new Set([...data.usernames, locals.user.username])];
		const teamSize = usernames.length;

		// The distinct team members
		const team = await db
			.select({
				uid: users.uid,
				username: users.username,
			})
			.from(users)
			.where(inArray(users.username, usernames));

		// Validate team members
		if (team.length !== teamSize) {
			const foundUsernames = team.map((u) => u.username);
			const notFoundUsernames = usernames.filter((username) => !foundUsernames.includes(username));

			return formfail({
				usernames: `Username${
					notFoundUsernames.length > 0 ? "s" : ""
				} not found: ${notFoundUsernames.join(", ")}`,
			});
		}

		// Validate tags
		const tagSet = new Set(data.tag);
		if (data.newtag?.length) tagSet.add(data.newtag);
		const entryTags = Array.from(tagSet).map((tag) => slugify(tag));

		// Should at least contain a level tag
		if (new Set(entryTags).intersection(new Set(levels)).size === 0) {
			return formfail({
				newtag: invalidTagsMessage,
			});
		}

		const failedTags: { tag: string; unknownWords: string[] }[] = [];

		for (const tag of entryTags) {
			const unknownWords = tag.split("-").filter((part) => !dictionary.has(part));

			if (unknownWords.length > 0) {
				failedTags.push({ tag, unknownWords });
			}
		}

		if (failedTags.length) {
			// Save attempted tags

			await db
				.insert(nonTags)
				.values(failedTags.map(({ tag }) => ({ name: tag })))
				.onConflictDoNothing();

			return formfail({
				tag: `Unknown word${failedTags.length === 1 ? "" : "s"}: ${conjunctionFormatter.format(
					failedTags.flatMap(({ unknownWords }) => unknownWords),
				)}`,
			});
		}

		// Save data
		try {
			const entryUid = crypto.randomUUID();
			const { thumbnail, url } = data;

			let thumbnailKey = null;
			let normalizedURL = url;

			if (!YOUTUBE_EMBEDDABLE.test(url)) {
				if (!thumbnail) {
					return formfail({ thumbnail: `Thumbnail required` });
				}

				thumbnailKey = crypto.randomUUID() + ".webp";
			} else {
				// Normalize youtube links
				normalizedURL = normalizeYoutubeLink(url);
			}

			// Save entry
			await db.insert(entries).values({
				uid: entryUid,
				category: data.category,
				title: data.title,
				description: data.description,
				url: normalizedURL,
				thumbnail: thumbnailKey,
			});

			// Save the thumbnail after the entry: we know it's not a duplicate
			if (thumbnail && thumbnailKey) {
				await saveThumbnail(thumbnail, thumbnailKey);
			}

			// Connect the creators and the entry
			await db.insert(userToEntry).values(team.map((user) => ({ userUid: user.uid, entryUid })));

			// Save tags and retrieve ids whether newly inserted or existing
			if (tagSet.size) {
				await db
					.insert(tags)
					.values(entryTags.map((tag) => ({ name: tag })))
					.onConflictDoNothing();

				const tagIds: { id: number }[] = await db
					.select({ id: tags.id })
					.from(tags)
					.where(inArray(tags.name, entryTags));

				await db.insert(entryToTag).values(tagIds.map(({ id }) => ({ entryUid, tagId: id })));
			}

			return redirect(303, "/user/entries");
		} catch (error) {
			console.log("[new entry]:", error);

			if (
				error instanceof postgres.PostgresError &&
				error.code === postgresErrorCode.unique_violation
			) {
				if (error.constraint_name === "entries_url_unique") {
					return formfail({ link: `Entry already exists` });
				}
			}

			throw error;
		}
	}),
};
