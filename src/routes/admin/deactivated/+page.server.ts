import { currentYear } from "$lib/config.js";
import { db } from "$lib/server/db";
import { type SelectEntry, type SelectFlag, type User } from "$lib/server/db/schema";
import { AdminForm, UpdateFlagReason } from "$lib/validation";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import * as fg from "formgator/sveltekit";

export const load = async ({ locals }) => {
	if (!locals.user?.isAdmin) return error(404);

	// Turn the left join into an inner join to hide entries deactivated (by admins) without being flagged

	const flagged: (Pick<SelectEntry, "uid" | "title" | "url"> &
		Pick<SelectFlag, "reason"> & { user_uid: string })[] = await db.execute(sql`
			select uid, title, url, reason, user_uid
			from entries left join flags
			on uid=entry_uid
			where entries.active='false'
			and date_part('year', entries.created_at)=${currentYear}
			order by uid;
		`);

	const entry_authors: (Pick<SelectEntry, "uid"> & Pick<User, "username">)[] = await db.execute(sql`
		select username, entry_uid as uid
		from users join user_to_entry
		on users.uid=user_to_entry.user_uid
		where entry_uid in ${flagged.map((entries) => entries.uid)}
		`);

	return { flagged, entry_authors };
};

export const actions = {
	reactivate: fg.formgate(AdminForm, async (data) => {
		await db.execute(sql`
			update entries set active='true' where uid in ${data.selected};
		`);

		return { flag: true };
	}),
	update_reason: fg.formgate(UpdateFlagReason, async (data) => {
		await db.execute(sql`
			update flags set reason=${data.reason} where (user_uid, entry_uid)=(${data.user_uid}, ${data.entry_uid});
		`);

		return { flag: true };
	}),
};
