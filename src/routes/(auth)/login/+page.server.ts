import * as auth from "$lib/server/auth.js";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema.js";
import { LoginSchema } from "$lib/validation";
import { fail, redirect } from "@sveltejs/kit";
import { eq, sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";

export const load = ({ locals }) => {
	if (locals.user) {
		return redirect(302, "/");
	}
};

export const actions = {
	default: formgate(LoginSchema, async (data, { cookies, setHeaders }) => {
		const [user] = await db
			.select({
				uid: users.uid,
				passwordHash: users.passwordHash,
			})
			.from(users)
			.where(eq(users.email, data.email));

		if (!user) {
			return formfail({ email: "Invalid email or password" });
		}

		const [isBanned]: { expires_at: string }[] = await db.execute(sql`
				select expires_at from bans
				where user_uid=${user.uid}
				and now() < expires_at
				order by expires_at desc
				limit 1;
			`);

		if (isBanned) {
			const isTemporary = isBanned.expires_at !== "infinity";

			setHeaders({ "Clear-Site-Data": "*" });

			return fail(403, {
				feedback: `Account suspended${
					isTemporary ? " until " + isBanned.expires_at.slice(0, 10) : "."
				}`,
			});
		}

		if (!user.passwordHash) {
			return fail(400, {
				feedback:
					"Welcome back! You need to <a href='/signup'>create an account</a> to upgrade your profile",
			});
		}

		// Verify password
		const validPassword = await auth.verify(user.passwordHash, data.password);

		if (!validPassword) {
			return formfail({ email: "Invalid email or password" });
		}

		const sessionId = auth.generateSessionToken();
		const session = await auth.createSession(sessionId, user.uid);
		auth.setSessionTokenCookie(cookies, sessionId, session.expiresAt);

		return redirect(303, "/user/entries");
	}),
};
