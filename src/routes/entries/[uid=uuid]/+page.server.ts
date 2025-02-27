import { db } from "$lib/server/db/client";
import { type SelectEntry, type SelectVote } from "$lib/server/db/schema.js";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async (event) => {
	const { uid } = event.params;

	const [entry]: Pick<
		SelectEntry,
		"title" | "description" | "category" | "thumbnail" | "url" | "rank" | "final_score"
	>[] = await db.execute(sql`
      select title, description, category, thumbnail, url, rank, final_score
      from entries
      where uid=${uid}
    `);

	const feedbacks: Pick<SelectVote, "score" | "feedback" | "maybe_rude">[] = await db.execute(sql`
      select score, feedback, maybe_rude
      from votes
      where entry_uid=${uid}
    `);

	if (!entry) {
		throw error(404);
	}

	return { entry, feedbacks };
};
