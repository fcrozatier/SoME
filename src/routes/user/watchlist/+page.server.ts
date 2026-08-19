import { ENTRY_STATE } from "$lib/constants.js";
import { assertIsLoggedIn } from "$lib/server/authorization.js";
import { db } from "$lib/server/db/index.js";
import type { SelectEntry } from "$lib/server/db/schema";
import { voteOpen } from "$lib/utils/time.js";
import { SkipSchema } from "$lib/validation";
import { type Actions, error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	assertIsLoggedIn(locals);

	const watchlist: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	>[] = await db.execute(sql`
      select uid, title, description, category, url, thumbnail
      from user_to_watchlist join entries on user_to_watchlist.entry_uid=entries.uid
      where user_uid=${locals.user.uid}
			and entries.state in ${[ENTRY_STATE.Active, ENTRY_STATE.Flagged]}
			;`);

	return { watchlist };
};

export const actions: Actions = {
	remove: formgate(SkipSchema, async (data, { locals }) => {
		assertIsLoggedIn(locals);

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
