import { db } from "$lib/server/db";
import type { SelectTag } from "$lib/server/db/schema.js";
import { type SelectEntry, type SelectVote } from "$lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async (event) => {
	const uid = event.params.uid;

	const [entry]: (Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "thumbnail" | "url" | "rank" | "final_score"
	> & { year: string })[] = await db.execute(sql`
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

	const feedbacks: Pick<SelectVote, "score" | "feedback" | "maybe_rude">[] = await db.execute(sql`
      select score, feedback, maybe_rude
      from votes
      where entry_uid=${uid}
    `);

	return { entry, tags: entryTags.map((t) => t.name), feedbacks };
};
