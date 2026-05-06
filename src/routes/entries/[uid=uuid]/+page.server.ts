import { currentYear } from "$lib/config.js";
import { db } from "$lib/server/db";
import type { SelectTag, User } from "$lib/server/db/schema.js";
import { type SelectEntry, type SelectVote } from "$lib/server/db/schema.js";
import { resultsAvailable } from "$lib/utils/time.js";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async (event) => {
	const isAdmin = event.locals.user?.isAdmin ?? false;
	const uid = event.params.uid;

	const [entry]: (Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "thumbnail" | "url" | "rank" | "final_score"
	> & { year: number })[] = await db.execute(sql`
      select uid, date_part('year', created_at) as year, title, description, category, thumbnail, url, rank, final_score
      from entries
      where uid=${uid}
    `);

	if (!entry) {
		throw error(404);
	}

	const entryTags: Pick<SelectTag, "name">[] = await db.execute(sql`
			select name from tags
			inner join entry_to_tag on tag_id=id
			where entry_uid=${uid};
		`);

	const feedbacks: (Pick<SelectVote, "score" | "feedback" | "maybe_rude"> &
		Pick<User, "username" | "bio" | "is_teacher">)[] = await db.execute(sql`
      select score, feedback, maybe_rude, username, bio, is_teacher
      from votes
			join users on votes.user_uid=users.uid
      where entry_uid=${uid}
    `);

	return {
		entry,
		tags: entryTags.map((t) => t.name),
		// Don't leak data in UI
		// Only admins see the profile info, and feedbacks are only displayed when the results are available
		feedbacks: isAdmin
			? feedbacks
			: entry.year === currentYear && !resultsAvailable()
				? []
				: feedbacks.map((f) => ({
						...f,
						bio: null,
						username: null,
						is_teacher: null,
					})),
		isAdmin,
	};
};
