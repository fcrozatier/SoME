import { dev } from "$app/environment";
import * as auth from "$lib/server/auth.js";
import { db } from "$lib/server/db";
import { postgresErrorCode } from "$lib/server/db/postgres_errors.js";
import { type InsertUser, users } from "$lib/server/db/schema.js";
import { addToMailingList, validateEmail } from "$lib/server/email";
import { NewUserSchema } from "$lib/validation.js";
import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";
import postgres from "postgres";

export const load = ({ locals }) => {
	if (locals.user) {
		return redirect(302, "/");
	}
};

export const actions = {
	default: formgate(NewUserSchema, async (data) => {
		const user: InsertUser = {
			uid: crypto.randomUUID(),
			username: data.username,
			passwordHash: await auth.hash(data.password),
			email: data.email,
			is_teacher: data.isTeacher,
		};

		// Email deliverability
		if (!dev) {
			const emailValidation = await validateEmail(user.email);

			if (emailValidation?.result !== "deliverable") {
				return formfail({ email: "Undeliverable email" });
			}
		}

		// Unique username
		const [other] = await db.select().from(users).where(eq(users.username, data.username));

		if (other) return formfail({ username: "This username is already taken" });

		// Save data
		try {
			await db.insert(users).values(user);

			if (!dev) {
				await addToMailingList(user.email, user.uid);
			}

			return redirect(302, "/login");
		} catch (error) {
			console.log("[signup]:", error);

			if (
				error instanceof postgres.PostgresError &&
				error.code === postgresErrorCode.unique_violation
			) {
				if (error.constraint_name === "users_email_unique") {
					const [targetUser] = await db.select().from(users).where(eq(users.email, user.email));

					// Check whether it's a legacy profile (no pwd) and update
					if (targetUser && !targetUser.passwordHash) {
						await db
							.update(users)
							.set({
								username: user.username,
								passwordHash: user.passwordHash,
							})
							.where(eq(users.email, user.email));

						return redirect(303, "/login");
					}

					return formfail({ email: "Profile already exists" });
				}
			}

			throw error;
		}
	}),
};
