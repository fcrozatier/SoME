import { dev } from "$app/environment";
import * as auth from "$lib/server/auth.js";
import { db } from "$lib/server/db";
import { postgresErrorCode } from "$lib/server/db/postgres_errors.js";
import { type InsertUser, users } from "$lib/server/db/schema.js";
import { addToMailingList, validateEmail } from "$lib/server/email";
import { InsertUserSchema } from "$lib/validation";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { type ValidationIssue } from "formgator";
import postgres from "postgres";

export const load = ({ locals }) => {
	if (locals.user) {
		redirect(302, "/");
	}
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const validation = InsertUserSchema.safeParse(formData);

		const issues = {
			username: undefined as ValidationIssue | undefined,
			password: undefined as ValidationIssue | undefined,
			email: undefined as ValidationIssue | undefined,
			rules: undefined as ValidationIssue | undefined,
		};

		if (!validation.success) {
			return fail(400, validation.error);
		}

		let user: InsertUser = {
			uid: crypto.randomUUID(),
			username: validation.data.username,
			passwordHash: await auth.hash(
				validation.data.password,
				auth.ARGON2_OPTIONS,
			),
			email: validation.data.email,
		};

		// Email deliverability validation
		if (!dev) {
			const emailValidation = await validateEmail(user.email);

			if (emailValidation?.result !== "deliverable") {
				issues.email = {
					code: "custom",
					message: "Undeliverable email",
				};

				return fail(400, { issues });
			}
		}

		// Unique username
		const [other] = await db
			.select()
			.from(users)
			.where(eq(users.username, validation.data.username));

		if (other) {
			issues.username = { code: "custom", message: "Username already taken" };
			return fail(400, { issues });
		}

		// Save data
		try {
			await db.insert(users).values(user);

			const sessionToken = auth.generateSessionToken();
			const session = await auth.createSession(sessionToken, user.uid);
			auth.setSessionTokenCookie(cookies, sessionToken, session.expiresAt);

			if (!dev) {
				try {
					await addToMailingList(user.email, user.uid);
				} catch (e) {
					console.error("[Registration]: couldn't add to mailing list", e);
				}
			}
			return { success: true };
		} catch (error) {
			console.log("[Registration]:", error);

			if (
				error instanceof postgres.PostgresError &&
				error.code === postgresErrorCode.unique_violation
			) {
				console.log(error);

				if (error.constraint_name === "users_email_unique") {
					const [targetUser] = await db.select().from(users).where(
						eq(users.email, user.email),
					);

					// Check whether it's a legacy profile (no pwd) and update
					if (targetUser && !targetUser.passwordHash) {
						await db
							.update(users)
							.set({
								username: user.username,
								passwordHash: user.passwordHash,
							})
							.where(eq(users.email, user.email));

						return { success: true };
					}

					issues.email = {
						code: "custom",
						message: "Profile already exists",
					};

					return fail(400, { issues });
				}
			}

			return fail(500);
		}
	},
};
