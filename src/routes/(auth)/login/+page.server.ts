import * as auth from "$lib/server/auth.js";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema.js";
import { LoginSchema } from "$lib/validation";
import { redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";

export const load = ({ locals }) => {
	if (locals.user) {
		return redirect(302, "/");
	}
};

export const actions = {
	default: formgate(LoginSchema, async (data, { cookies }) => {
		const [user] = await db.select().from(users).where(
			eq(users.email, data.email),
		);

		if (!user?.passwordHash) {
			return formfail({ username: "Invalid email or password" });
		}

		// Verify password
		const validPassword = await auth.verify(
			user.passwordHash,
			data.password,
		);

		if (!validPassword) {
			return formfail({ username: "Invalid email or password" });
		}

		const sessionId = auth.generateSessionToken();
		const session = await auth.createSession(sessionId, user.uid);
		auth.setSessionTokenCookie(cookies, sessionId, session.expiresAt);

		return redirect(303, "/profile");
	}),
};
