import { db } from "$lib/server/db/index.js";
import type { SelectEntry, SelectVote } from "$lib/server/db/schema";
import { parseAndSanitizeMarkdown } from "$lib/utils/markdown.js";
import { voteOpen } from "$lib/utils/time.js";
import { VoteSchema } from "$lib/validation";
import { type Actions, error, redirect } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, "/login");
	}

	const votes: (Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	> &
		Pick<SelectVote, "score" | "feedback_unsafe_md" | "feedback" | "created_at">)[] =
		await db.execute(sql`
      select score, feedback, feedback_unsafe_md, votes.created_at, uid, title, description, category, url, thumbnail
      from votes join entries on entry_uid=uid
      where user_uid=${locals.user.uid};`);

	return { votes };
};

export const actions: Actions = {
	update: formgate(VoteSchema, async (data, { locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}

		if (!voteOpen()) {
			return error(400);
		}

		const feedbackSafe = await parseAndSanitizeMarkdown(data.feedback);

		await db.execute(
			sql`update votes
      set score=${data.score}, feedback=${feedbackSafe}, feedback_unsafe_md=${data.feedback}
      where (user_uid, entry_uid)=(${locals.user.uid}, ${data.uid});`,
		);

		return { success: true };
	}),
};
