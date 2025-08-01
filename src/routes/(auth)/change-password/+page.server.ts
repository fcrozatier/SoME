import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { ChangePasswordSchema } from "$lib/validation";
import { eq } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";
import * as auth from "$lib/server/auth";
import type { Actions } from "./$types";
import { dev } from "$app/environment";
import { sendEmail } from "$lib/server/email";
import { fail } from "@sveltejs/kit";

export const actions: Actions = {
	default: formgate(ChangePasswordSchema, async (data) => {
		const email = data.email;
		const emailToken = crypto.randomUUID();

		const [user] = await db
			.select({ uid: users.uid, hash: users.passwordHash })
			.from(users)
			.where(eq(users.email, email));

		if (!user) {
			// Prevents polling the db
			return { success: true };
		}

		if (!user.hash) {
			return fail(400, {
				feedback:
					"Welcome back! You need to <a href='/signup'>create an account</a> to upgrade your profile",
			});
		}

		if (data.password !== data.password2) {
			return formfail({ password2: "Passwords must match" });
		}

		await db
			.update(users)
			.set({
				newPasswordHash: await auth.hash(data.password),
				newPasswordValidationToken: emailToken,
			})
			.where(eq(users.email, email));

		if (dev) {
			console.log("validate your password reset here:");
			console.log(`localhost:5176/change-password/${emailToken}`);
		} else {
			await sendEmail(email, "registration", { token: emailToken });
		}

		return { success: true };
	}),
};
