import { db } from "$lib/server/db/index.js";
import type { SelectEntry, SelectVote } from "$lib/server/db/schema";
import { parseAndSanitizeMarkdown } from "$lib/utils/markdown.js";
import { voteOpen } from "$lib/utils/time.js";
import { SkipSchema, VoteSchema } from "$lib/validation";
import { type Actions, error, redirect } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	if (!locals.user) {
		return redirect(302, "/login");
	}

	const watchlist: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	>[] = await db.execute(sql`
      select uid, title, description, category, url, thumbnail
      from user_to_watchlist join entries on user_to_watchlist.entry_uid=entries.uid
      where user_uid=${locals.user.uid};`);

	return { watchlist };
};

export const actions: Actions = {
	remove: formgate(SkipSchema, async (data, { locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}

		if (!voteOpen()) {
			return error(400);
		}

		await db.execute(
			sql`delete from user_to_watchlist
      where (user_uid, entry_uid)=(${locals.user.uid}, ${data.uid});`,
		);

		return { success: true };
	}),
};
