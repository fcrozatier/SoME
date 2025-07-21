import { db } from "$lib/server/db/index.js";
import { formgate } from "formgator/sveltekit";
import { users } from "$lib/server/db/schema.js";
import { type Actions, redirect } from "@sveltejs/kit";
import { eq } from "drizzle-orm";
import { UpdateProfileSchema } from "$lib/validation.js";

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
	default: formgate(UpdateProfileSchema, async (data, { locals }) => {
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
};
