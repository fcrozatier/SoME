import { dev } from "$app/environment";
import { conjunctionFormatter } from "$lib/config.js";
import { db } from "$lib/server/db";
import { postgresErrorCode } from "$lib/server/db/postgres_errors.js";
import { entries, entriesToTags, tags, users, usersToEntries } from "$lib/server/db/schema.js";
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
	if (!submissionsOpen() && !locals?.user?.isAdmin) {
		throw error(403, "Submissions are closed");
	}

	if (!locals?.user?.uid) {
		throw redirect(302, "/login");
	}
};

export const actions = {
	default: formgate(NewEntrySchema, async (data, { locals }) => {
		if (!locals.user || !locals.user.username) {
			throw error(401, "You must be logged in");
		}

		if (!submissionsOpen() && !locals.user.isAdmin) {
			throw error(403, "Submissions are closed");
		}

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

		const unknownWords = entryTags
			.flatMap((tag) => tag.split("-"))
			.filter((part) => !dictionary.has(part));

		if (unknownWords.length) {
			return formfail({
				tag: `Unknown word${unknownWords.length === 1 ? "" : "s"}: ${conjunctionFormatter.format(
					unknownWords,
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
			if (!dev && thumbnail && thumbnailKey) {
				await saveThumbnail(thumbnail, thumbnailKey);
			}

			// Connect the creators and the entry
			await db.insert(usersToEntries).values(team.map((user) => ({ userUid: user.uid, entryUid })));

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

				await db.insert(entriesToTags).values(tagIds.map(({ id }) => ({ entryUid, tagId: id })));
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
