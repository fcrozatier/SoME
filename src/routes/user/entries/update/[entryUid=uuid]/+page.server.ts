import { ENTRY_STATE, STRIKE_STATE } from "$lib/constants.js";
import { assertIsCreator, assertIsLoggedIn } from "$lib/server/authorization.js";
import { db, DB_CONTRAINTS, isPostgresError } from "$lib/server/db";
import { POSTGRES_ERROR_CODE } from "$lib/server/db/postgres_errors.js";
import type { SelectEntry, SelectTag, User } from "$lib/server/db/schema.js";
import {
	entries,
	entriesHistory,
	entryToTag,
	nonTags,
	tags,
	users,
	userToEntry,
	votes,
} from "$lib/server/db/schema.js";
import { deleteThumbnail, saveThumbnail } from "$lib/server/s3";
import { dictionary } from "$lib/utils/dictionary.server.js";
import { conjunctionFormatter } from "$lib/utils/formatting.js";
import { parseAndSanitizeMarkdown } from "$lib/utils/markdown";
import { normalizeYoutubeLink, YOUTUBE_EMBEDDABLE } from "$lib/utils/regex";
import { slugify } from "$lib/utils/slugify.js";
import { submissionsOpen } from "$lib/utils/time.js";
import { invalidTagsMessage, levels, NewEntrySchema } from "$lib/validation";
import type { Prettify } from "@fcrozatier/ts-helpers";
import { error, fail, redirect } from "@sveltejs/kit";
import { and, eq, inArray, sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";
import z from "zod";

export const load = async ({ locals, params }) => {
	if (!submissionsOpen()) {
		throw error(403, "Submissions are closed");
	}

	assertIsLoggedIn(locals);

	const { entryUid } = params;
	const { user } = locals;

	const [entry]: Pick<
		SelectEntry,
		"uid" | "title" | "description_md" | "category" | "url" | "thumbnail"
	>[] = await db.execute(sql`
    select uid, title, description_md, category, url, thumbnail from entries
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
	update: formgate(NewEntrySchema, async (data, { locals, params }) => {
		try {
			assertIsLoggedIn(locals);

			const { user } = locals;
			const { entryUid } = params;

			if (!user.username) {
				throw error(401, "Please choose a username on your Profile page before submitting");
			}

			if (!submissionsOpen() && !user.isAdmin) {
				// Check entry state: we can update an entry anytime if it as an open issue
				const [entry]: Prettify<Pick<SelectEntry, "state">>[] = await db.execute(sql`
						select state from entries
						where uid=${entryUid};
					`);

				if (entry?.state !== ENTRY_STATE.ActionRequired) {
					throw error(403, "Submissions are closed");
				}
			}

			// Validate youtube entries creation date and channel identity
			const id = data.url.match(YOUTUBE_EMBEDDABLE)?.groups?.id;
			// if (id) await validateYtCreationDate(id);

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
				.select({ oldThumbnailKey: entries.thumbnail, oldUrl: entries.url })
				.from(entries)
				.where(eq(entries.uid, entryUid));

			if (!entry) {
				throw new Error("Entry not found");
			}

			const { oldThumbnailKey, oldUrl } = entry;
			const { thumbnail, url } = data;

			let normalizedLink = url;
			let thumbnailKey = undefined;

			if (!YOUTUBE_EMBEDDABLE.test(url)) {
				if (!thumbnail && !oldThumbnailKey) {
					return formfail({ thumbnail: `Thumbnail required` });
				}
				if (thumbnail) {
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

			const description = await parseAndSanitizeMarkdown(data.description);

			// Update entry
			await db
				.update(entries)
				.set({
					category: data.category,
					description,
					description_md: data.description,
					title: data.title,
					url: normalizedLink,
					thumbnail: thumbnailKey,
					updatedAt: new Date().toISOString(),
				})
				.where(eq(entries.uid, entryUid));

			// Update entry history
			await db.insert(entriesHistory).values({
				entry_uid: entryUid,
				category: data.category,
				description_md: data.description,
				title: data.title,
				url: normalizedLink,
				thumbnail: thumbnailKey,
				editedBy: user.uid,
			});

			// Delete the old thumbnail if there is a new one
			if (thumbnail && oldThumbnailKey) {
				await deleteThumbnail(oldThumbnailKey);
			}

			// Save the thumbnail after the entry: we know it's not a duplicate
			if (thumbnail && thumbnailKey) {
				await saveThumbnail(thumbnail, thumbnailKey);
			}

			// Connect the creators and the entry
			await db
				.insert(userToEntry)
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

			await db.delete(entryToTag).where(
				and(
					eq(entryToTag.entryUid, entryUid),
					inArray(
						entryToTag.tagId,
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
					.insert(entryToTag)
					.values(tagIds.map(({ id }) => ({ entryUid, tagId: id })))
					.onConflictDoNothing();
			}

			return redirect(303, "/user/entries");
		} catch (error) {
			console.log("[entry update]:", error);

			if (
				error instanceof Error &&
				isPostgresError(
					error.cause,
					POSTGRES_ERROR_CODE.UniqueViolation,
					DB_CONTRAINTS.EntriesURLUnique,
				)
			) {
				return formfail({ url: `An entry with this URL already exists` });
			}

			throw error;
		}
	}),
	delete: async ({ locals, request }) => {
		assertIsLoggedIn(locals);

		const user = locals.user;
		const formData = await request.formData();
		const zodResult = z.uuid().safeParse(formData.get("entryUid"));

		if (!zodResult.success) return fail(422);

		const entryUid = zodResult.data;

		// Make sure user is the creator first
		await assertIsCreator({ userUid: user.uid, entryUid });

		// Soft delete entry
		await db.execute(
			sql`
				update entries
				set deleted_by=${user.uid}, deleted_at=now()
				where uid=${entryUid};
			`,
		);

		// Close issues if any on this entry
		await db.execute(
			sql`
				update strikes
				set state=${STRIKE_STATE.Closed}
				where entry_uid=${entryUid};
			`,
		);

		return redirect(303, "/user/entries");
	},
};
