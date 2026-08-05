import { assertIsAdmin } from "$lib/server/authorization";
import { CURRENT_YEAR, ENTRY_STATE } from "$lib/constants.js";
import { db } from "$lib/server/db";
import { flags, type SelectEntry } from "$lib/server/db/schema";
import { AdminFlagForm } from "$lib/validation";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals, url }) => {
	assertIsAdmin(locals);

	let page = url.searchParams.get("page");

	if (!page) {
		url.searchParams.set("page", "1");
		page = "1";
	}
	const limit = 50;

	const entries: (Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	> & { pages: number })[] = await db.execute(sql`
			with paginated as (
				select uid, title, description, category, url, thumbnail, count(*) over () as total
				from entries
				where entries.active='true'
				and deleted_at is null
				and date_part('year', entries.created_at)=${CURRENT_YEAR}
				order by created_at
				limit ${limit}
				offset ${(+page - 1) * limit}
			)

			select *, ceil(total::numeric / ${limit})::int as pages from paginated;
		`);

	return { entries, pages: entries[0]?.pages ?? 1 };
};

export const actions = {
	flag: formgate(AdminFlagForm, async (data, { locals }) => {
		assertIsAdmin(locals);

		await db.execute(sql`
			update entries set state=${ENTRY_STATE.Flagged} where uid=${data.uid};
		`);

		await db.insert(flags).values({
			entryUid: data.uid,
			userUid: locals.user.uid,
			reason: data.reason,
		});

		return { success: true };
	}),
};
