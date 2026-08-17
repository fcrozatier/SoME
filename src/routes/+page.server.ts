import { CURRENT_YEAR, defaultYear, ENTRY_STATE } from "$lib/constants";
import { db } from "$lib/server/db";
import { type SelectEntry } from "$lib/server/db/schema";
import type { Prettify } from "@fcrozatier/ts-helpers";
import { sql } from "drizzle-orm";

export const load = async ({ locals }) => {
	const top: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "thumbnail" | "url"
	>[] = await db.execute(sql`
		 select uid, title, description, category, thumbnail, url
		 from entries
		 where entries.state=${ENTRY_STATE.Active}
		 and deleted_at is null
		 and date_part('year', created_at)=${defaultYear()}
		 order by final_score desc nulls last
	   limit 5;
		`);

	const user = locals.user;

	let selection: Prettify<
		Pick<SelectEntry, "uid" | "title" | "description" | "category" | "thumbnail" | "url">
	>[] = [];

	if (user) {
		selection = await db.execute(sql`
			select uid, title, description, entries.category, thumbnail, url
		 	from cache
			join entries
			on cache.entry_uid=entries.uid
			where user_uid=${user.uid}
			and date_part('year', cache.created_at)=${CURRENT_YEAR};
		`);
	}

	return { top, selection };
};
