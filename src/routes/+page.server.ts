import { dev } from "$app/environment";
import { db } from "$lib/server/db";
import { type SelectEntry, users } from "$lib/server/db/schema";
import { addToMailingList, sendEmail, validateEmail } from "$lib/server/email";
import { EmailSchema } from "$lib/validation";
import { type Actions, fail } from "@sveltejs/kit";
import { eq, sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";

export const load = async () => {
	const top: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "thumbnail" | "url"
	>[] = await db.execute(sql`
		 select uid, title, description, category, thumbnail, url from entries
		 where active='t'
		 and date_part('year', entries.created_at)='2024'
		 order by final_score desc nulls last
     limit 25;
		`);

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
			const emailValidation = await validateEmail(email);
			if (emailValidation?.result !== "deliverable") {
				return formfail({ email: "Undeliverable email" });
			}
		}

		const token = crypto.randomUUID();

		await db.insert(users).values({ uid: token, email });

		if (!dev) {
			await addToMailingList(email, token);
		}

		return { success: true };
	}),

	resend_link: formgate({ email: EmailSchema }, async (data) => {
		try {
			// Find user
			const [user] = await db.select().from(users).where(
				eq(users.email, data.email),
			);

			if (!user) {
				return formfail({
					email: "email not found. Did you register to this year's event?",
				});
			}

			const token = user.uid;

			console.log(`Your personal link is /vote/${token}`);
			if (!dev) {
				await sendEmail(data.email, "resend_token", { token });
			}
			return { success: true };
		} catch (error) {
			console.log(error);
			return fail(400, { error: true, message: "Something went wrong" });
		}
	}),
};
