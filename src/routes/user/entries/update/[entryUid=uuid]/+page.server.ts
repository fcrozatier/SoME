import { dev } from "$app/environment";
import { conjunctionFormatter } from "$lib/config.js";
import { db } from "$lib/server/db";
import { postgresErrorCode } from "$lib/server/db/postgres_errors.js";
import type { SelectEntry, SelectTag, User } from "$lib/server/db/schema.js";
import {
	entries,
	entriesToTags,
	nonTags,
	tags,
	users,
	usersToEntries,
	votes,
} from "$lib/server/db/schema.js";
import { saveThumbnail } from "$lib/server/s3";
import { dictionary } from "$lib/utils/dictionary.server.js";
import { normalizeYoutubeLink, YOUTUBE_EMBEDDABLE } from "$lib/utils/regex";
import { slugify } from "$lib/utils/slugify.js";
import { submissionsOpen } from "$lib/utils/time.js";
import { invalidTagsMessage, levels, NewEntrySchema } from "$lib/validation";
import { error, fail, redirect } from "@sveltejs/kit";
import { and, eq, inArray, sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";
import postgres from "postgres";

export const load = async ({ locals, params }) => {
	if (!submissionsOpen()) {
		throw error(403, "Submissions are closed");
	}

	if (!locals?.user?.uid) {
		throw redirect(302, "/login");
	}

	const { entryUid } = params;
	const { user } = locals;

	const [entry]: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	>[] = await db.execute(sql`
    select uid, title, description, category, url, thumbnail from entries
    inner join user_to_entry on user_to_entry.entry_uid=entries.uid
    inner join entry_to_tag on entry_to_tag.entry_uid=entries.uid
    where entries.uid=${entryUid}
    and user_uid=${user.uid};
  `);

	if (!entry) {
		return error(404, "Entry not found");
	}

	const coauthors: Pick<User, "username">[] = await db.execute(sql`
    select username from users
    join user_to_entry on user_uid=users.uid
    where entry_uid=${entryUid}
    and users.username <> ${user.username};
  `);

	const entryTags: Pick<SelectTag, "name">[] = await db.execute(sql`
    select name from tags
    inner join entry_to_tag on tag_id=id
    where entry_uid=${entryUid};
  `);

	return {
		entry,
		coauthors: coauthors.map((a) => a.username).filter((a) => a !== null),
		tags: entryTags.map((t) => t.name),
	};
};

export const actions = {
	default: formgate(NewEntrySchema, async (data, { locals, params }) => {
		try {
			const { user } = locals;
			const { entryUid } = params;

			if (!user || !user.username) {
				throw error(401, "You must be logged in");
			}

			if (!submissionsOpen() && !user.isAdmin) {
				throw error(403, "Submissions are closed");
			}

			const prevCoauthors: Pick<User, "username" | "uid">[] = await db.execute(
				sql`
          select username, uid from users
          join user_to_entry on user_uid=users.uid
          where entry_uid=${entryUid};
        `,
			);

			// curr = prev + new - former
			const usernames = [...new Set([...data.usernames, user.username])];

			// The distinct team members
			const team = await db
				.select({
					uid: users.uid,
					username: users.username,
				})
				.from(users)
				.where(inArray(users.username, usernames));

			const formerCoauthors = prevCoauthors.filter((a) => !usernames.includes(a.username!));

			// Validate team members
			if (team.length !== usernames.length) {
				const foundUsernames = team.map((u) => u.username);
				const notFoundUsernames = usernames.filter(
					(username) => !foundUsernames.includes(username),
				);

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

			// Detach former coauthors
			if (formerCoauthors.length > 0) {
				await db.execute(sql`
          delete from user_to_entry
          where entry_uid=${entryUid}
          and user_uid in ${formerCoauthors.map((a) => a.uid)};
        `);
			}

			// Retrieve the thumbnail and link of the entry

			const [entry] = await db
				.select({ oldThumbnail: entries.thumbnail, oldUrl: entries.url })
				.from(entries)
				.where(eq(entries.uid, entryUid));

			if (!entry) {
				throw new Error("Entry not found");
			}

			const { oldThumbnail, oldUrl } = entry;
			const { thumbnail, url } = data;

			let normalizedLink = url;
			let thumbnailKey = oldThumbnail;

			if (!YOUTUBE_EMBEDDABLE.test(url)) {
				if (!thumbnail && !oldThumbnail) {
					return formfail({ thumbnail: `Thumbnail required` });
				}
				if (thumbnail && !oldThumbnail) {
					thumbnailKey = crypto.randomUUID() + ".webp";
				}
			} else {
				// Normalize youtube links
				normalizedLink = normalizeYoutubeLink(url);
			}

			if (oldUrl !== normalizedLink) {
				if (!submissionsOpen()) {
					return fail(422, {
						message: "You can't update the link once the vote is open",
					});
				}
				// Remove all votes in case the link was changed
				await db.delete(votes).where(eq(votes.entryUid, entryUid));
			}

			// Update entry
			await db
				.update(entries)
				.set({
					category: data.category,
					description: data.description,
					title: data.title,
					url: normalizedLink,
					thumbnail: thumbnailKey,
				})
				.where(eq(entries.uid, entryUid));

			// Save the thumbnail after the entry: we know it's not a duplicate
			if (!dev && thumbnail && thumbnailKey) {
				await saveThumbnail(thumbnail, thumbnailKey);
			}

			// Connect the creators and the entry
			await db
				.insert(usersToEntries)
				.values(team.map((user) => ({ userUid: user.uid, entryUid })))
				.onConflictDoNothing();

			// Tags
			const oldEntryTags: Pick<SelectTag, "name" | "id">[] = await db.execute(
				sql`
        select name, id from tags
        inner join entry_to_tag on id=tag_id
        where entry_uid=${entryUid};
      `,
			);

			await db.delete(entriesToTags).where(
				and(
					eq(entriesToTags.entryUid, entryUid),
					inArray(
						entriesToTags.tagId,
						oldEntryTags.filter((t) => !entryTags.includes(t.name)).map((t) => t.id),
					),
				),
			);

			if (tagSet.size) {
				// Save new tags
				await db
					.insert(tags)
					.values(entryTags.map((tag) => ({ name: tag })))
					.onConflictDoNothing();

				const tagIds: { id: number }[] = await db
					.select({ id: tags.id })
					.from(tags)
					.where(inArray(tags.name, entryTags));

				// Update entry tags
				await db
					.insert(entriesToTags)
					.values(tagIds.map(({ id }) => ({ entryUid, tagId: id })))
					.onConflictDoNothing();
			}

			return redirect(303, "/user/entries");
		} catch (error) {
			console.log("[entry update]:", error);

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
