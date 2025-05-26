import { dev } from "$app/environment";
import { conjunctionFormatter } from "$lib/config.js";
import { db } from "$lib/server/db";
import { postgresErrorCode } from "$lib/server/db/postgres_errors.js";
import {
  entries,
  entriesToTags,
  tags,
  users,
  usersToEntries,
} from "$lib/server/db/schema.js";
import { saveThumbnail } from "$lib/server/s3";
import { dictionary } from "$lib/utils/dictionary.server.js";
import { normalizeYoutubeLink, YOUTUBE_EMBEDDABLE } from "$lib/utils/regex";
import { slugify } from "$lib/utils/slugify.js";
import { submissionsOpen } from "$lib/utils/time.js";
import { NewEntrySchema } from "$lib/validation";
import { error, fail, redirect } from "@sveltejs/kit";
import { inArray, sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";
import postgres from "postgres";

export const load = async ({ locals }) => {
  if (!submissionsOpen() && !locals?.user?.isAdmin) {
    throw error(403, "Submissions are closed");
  }

  if (!locals?.user?.uid) {
    throw redirect(302, "/login");
  }

  const year = (new Date()).getFullYear();
  const [submitted] = await db.execute<{ count: string }>(sql`
    select count(*)
    from user_to_entry
    inner join entries on entry_uid=uid
    where user_uid=${locals.user.uid}
    and date_part('year', created_at)=${year};
    `);

  if (Number(submitted?.count)) {
    throw error(403, `You already submitted an entry for the ${year} edition`);
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

    const teamSize = data.usernames.includes(locals.user.username)
      ? data.usernames.length
      : data.usernames.length + 1;

    // The distinct team members
    const team = await db.select({
      uid: users.uid,
      username: users.username,
    }).from(users)
      .where(
        inArray(
          users.username,
          Array.from(new Set(...data.usernames, locals.user.username)),
        ),
      );

    // Validate team members
    if (team.length !== teamSize) {
      const usernames = team.map((u) => u.username);
      const not_found = data.usernames.filter((username) =>
        !usernames.includes(username)
      );
      return formfail({
        usernames: `Username${not_found.length > 0 ? "s" : ""} not found: ${
          not_found.join(", ")
        }`,
      });
    }

    // Validate tags
    const tagSet = new Set(data.tag);
    if (data.newTag?.length) tagSet.add(data.newTag);
    const entryTags = Array.from(tagSet).map((tag) => slugify(tag));

    const unknownTags = entryTags.filter((t) =>
      !t.split("-").every((part) => dictionary.has(part))
    );

    if (unknownTags.length) {
      return formfail({
        tag: `Unknown word${unknownTags.length === 1 ? "" : "s"}: ${
          conjunctionFormatter.format(unknownTags)
        }`,
      });
    }

    // Save data
    try {
      // Save tags and retrieve ids whether newly inserted or existing
      await db.insert(tags)
        .values(entryTags.map((tag) => ({ name: tag })))
        .onConflictDoNothing();

      const tagIds: { id: number }[] = await db.select({ id: tags.id })
        .from(tags)
        .where(inArray(tags.name, entryTags));

      const entryUid = crypto.randomUUID();
      const { thumbnail, link } = data;
      let thumbnailKey = null;
      let normalizedLink = link;

      if (!YOUTUBE_EMBEDDABLE.test(link)) {
        if (!thumbnail) {
          return formfail({ thumbnail: `Thumbnail required` });
        }

        thumbnailKey = crypto.randomUUID() + ".webp";
      } else {
        // Normalize youtube links
        normalizedLink = normalizeYoutubeLink(link);
      }

      // Save entry
      await db.insert(entries).values({
        uid: entryUid,
        category: data.category,
        title: data.title,
        description: data.description,
        url: normalizedLink,
        thumbnail: thumbnailKey,
      });

      // Add tags
      await db.insert(entriesToTags)
        .values(tagIds.map(({ id }) => ({ entryUid, tagId: id })));

      // Save the thumbnail after the entry: we know it's not a duplicate
      if (!dev && thumbnail && thumbnailKey) {
        await saveThumbnail(thumbnail, thumbnailKey);
      }

      // Connect the creators and the entry
      await db.insert(usersToEntries)
        .values(team.map((user) => ({ userUid: user.uid, entryUid })));

      return { success: true };
    } catch (error) {
      if (
        error instanceof postgres.PostgresError &&
        error.code === postgresErrorCode.unique_violation
      ) {
        if (error.constraint_name === "entries_url_unique") {
          return formfail({ link: `Entry already exists` });
        }
      }

      console.log("submission error", error);
      return fail(500, { network: true });
    }
  }),
};
