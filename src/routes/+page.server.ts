import { dev } from "$app/environment";
import { defaultYear } from "$lib/config";
import { db } from "$lib/server/db";
import { type SelectEntry, users } from "$lib/server/db/schema";
import { addToMailingList } from "$lib/server/email";
import { EmailSchema } from "$lib/validation";
import { type Actions } from "@sveltejs/kit";
import { eq, sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";

export const load = async () => {
	const top: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "thumbnail" | "url"
	>[] = await db.execute(sql`
		 select uid, title, description, category, thumbnail, url from entries
		 where active='t'
		 and date_part('year', entries.created_at)=${defaultYear}
		 order by final_score desc nulls last
	   limit 5;
		`);

	// const winners: Pick<
	// 	SelectEntry,
	// 	"uid" | "title" | "description" | "category" | "thumbnail" | "url"
	// >[] = await db.execute(sql`
	// 	 select uid, title, description, category, thumbnail, url from entries
	// 	 where uid in (
	// 	 	'e55b9384-641c-4709-8aef-3447c8d25e80',
	// 		'6ed691c3-cfef-49c9-b1ed-2adf66536c0b',
	// 		'c46f3c19-f1e2-402e-af55-8b4b61c508b3',
	// 		'd4dd701c-240a-48d3-ac87-cbba560afee5',
	// 		'b8300cb6-9de1-44d4-ac2a-fd1ca5b20819'
	// 		);
	// 	`);

	return { top };
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
