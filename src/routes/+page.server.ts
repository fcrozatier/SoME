import { dev } from "$app/environment";
import { CURRENT_YEAR, defaultYear, ENTRY_STATE } from "$lib/constants";
import { db } from "$lib/server/db";
import { type SelectEntry, users } from "$lib/server/db/schema";
import { addToMailingList } from "$lib/server/email";
import { EmailSchema } from "$lib/validation";
import type { Prettify } from "@fcrozatier/ts-helpers";
import { type Actions } from "@sveltejs/kit";
import { eq, sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";

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

export const actions: Actions = {
	newsletter: formgate({ email: EmailSchema }, async (data) => {
		const email = data.email;

		// Find user
		const [user] = await db.select().from(users).where(eq(users.email, email));

		if (user) {
			return formfail({ email: "Email already registered" });
		}

		if (!dev) {
			// Validate email
			// const emailValidation = await validateEmail(email);
			// if (emailValidation?.result !== "deliverable") {
			// 	return formfail({ email: "Undeliverable email" });
			// }
		}

		const token = crypto.randomUUID();

		await db.insert(users).values({ uid: token, email });

		if (!dev) {
			await addToMailingList(email, token);
		}

		return { success: true };
	}),
};
