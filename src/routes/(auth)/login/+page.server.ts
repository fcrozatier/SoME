import * as auth from "$lib/server/auth.js";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema.js";
import { LoginSchema } from "$lib/validation";
import { fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export const load = ({ locals }) => {
	if (locals.user) {
		return redirect(302, "/");
	}
};

export const actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const validation = LoginSchema.safeParse(formData);
		const issues = { credentials: { message: "Invalid email or password" } };

		if (!validation.success) {
			return fail(400, { issues });
		}

		const [user] = await db.select().from(users).where(eq(users.email, validation.data.email));

		if (!user?.passwordHash) {
			return fail(400, { issues });
		}

		// Verify password
		const validPassword = await auth.verify(user.passwordHash, validation.data.password);

		if (!validPassword) {
			return fail(400, { issues });
		}

		const sessionId = auth.generateSessionToken();
		const session = await auth.createSession(sessionId, user.uid);
		auth.setSessionTokenCookie(cookies, sessionId, session.expiresAt);

		return redirect(303, "/profile");
	},
};
