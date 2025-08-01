import { currentYear } from "$lib/config.js";
import { db } from "$lib/server/db";
import { type SelectEntry } from "$lib/server/db/schema";
import { AdminForm } from "$lib/validation";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async () => {
	const feedbacks: (Pick<SelectEntry, "uid" | "title" | "url"> & {
		feedback: string;
		user_uid: string;
	})[] = await db.execute(sql`
			select uid, title, url, user_uid, feedback
			from entries join votes
			on uid=entry_uid
			where entries.active='true'
			and date_part('year', entries.created_at)=${currentYear}
			and votes.reviewed='false'
			and votes.maybe_rude='true'
			order by uid
			limit all
			offset 0;
		`);

	return { feedbacks };
};

export const actions = {
	keep: formgate(AdminForm, async (data) => {
		await db.execute(sql`
				update votes set maybe_rude='false', reviewed='true' where (user_uid, entry_uid) in ${data.selected.map(
					(s) => s.split(","),
				)}
			`);

		return { success: true };
	}),
	remove: formgate(AdminForm, async (data) => {
		await db.execute(sql`
				update votes set maybe_rude='true', reviewed='true' where (user_uid, entry_uid) in ${data.selected.map(
					(s) => s.split(","),
				)}
			`);

		return { success: true };
	}),
};
