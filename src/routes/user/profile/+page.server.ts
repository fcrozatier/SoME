import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db/index.js";
import { users } from "$lib/server/db/schema.js";
import { DeleteProfileSchema, UpdateProfileSchema } from "$lib/validation.js";
import { type Actions, fail, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	if (!locals.user) return redirect(302, "/login");

	const [user] = await db
		.select({
			email: users.email,
			isTeacher: users.isTeacher,
			bio: users.bio,
		})
		.from(users)
		.where(eq(users.uid, locals.user.uid));

	if (!user) return redirect(302, "/login");

	return {
		user: {
			username: locals.user.username,
			email: user.email,
			isTeacher: !!user.isTeacher,
			bio: user.bio,
		},
	};
};

export const actions: Actions = {
	update: formgate(UpdateProfileSchema, async (data, { locals }) => {
		if (!locals.user?.uid) throw redirect(301, "/login");

		await db
			.update(users)
			.set({
				isTeacher: data.isTeacher,
				username: data.username,
				bio: data.bio,
			})
			.where(eq(users.uid, locals.user.uid));

		return { data };
	}),
	delete: formgate(DeleteProfileSchema, async (data, event) => {
		const { locals } = event;
		if (!locals.user?.uid) throw redirect(302, "/login");

		const [user] = await db.select().from(users).where(
			eq(users.uid, locals.user.uid),
		);

		if (!user?.passwordHash) {
			return fail(401);
		}

		// Verify password
		const validPassword = await auth.verify(user.passwordHash, data.password);

		if (!validPassword) {
			return formfail({ password: "Invalid password" });
		}

		if (!locals.session) {
			return fail(401);
		}

		await auth.invalidateSession(locals.session.id);
		auth.deleteSessionTokenCookie(event);

		await db
			.delete(users)
			.where(eq(users.uid, locals.user.uid));

		return redirect(303, "/");
	}),
};
