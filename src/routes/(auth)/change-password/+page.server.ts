import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { ChangePasswordSchema } from "$lib/validation";
import { eq } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";
import * as auth from "$lib/server/auth";
import type { Actions } from "./$types";
import { dev } from "$app/environment";

export const actions: Actions = {
	default: formgate(ChangePasswordSchema, async (data) => {
		const email = data.email;
		const emailToken = crypto.randomUUID();

		if (data.password !== data.password2) {
			return formfail({ password2: "Passwords must match" });
		}

		await db.update(users).set({
			newPasswordHash: await auth.hash(data.password),
			newPasswordValidationToken: emailToken,
		}).where(eq(users.email, email));

		if (dev) {
			console.log("validate your password reset here:");
			console.log(`localhost:5176/change-password/${emailToken}`);
		} else {
			// await sendEmailTemplate(email, "password-reset", { token: emailToken });
		}

		return { success: true };
	}),
};
