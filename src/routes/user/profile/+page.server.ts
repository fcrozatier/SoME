import * as auth from "$lib/server/auth";
import { db } from "$lib/server/db/index.js";
import { userToTag } from "$lib/server/db/schema.js";
import { type SelectTag, type User, users } from "$lib/server/db/schema.js";
import { DeleteProfileSchema, UpdateProfileSchema } from "$lib/validation.js";
import { type Actions, fail, redirect } from "@sveltejs/kit";
import { eq, sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	if (!locals.user) return redirect(302, "/login");

	const uid = locals.user.uid;

	const [user]: Pick<User, "email" | "is_teacher" | "bio">[] = await db.execute(
		sql`
			select email, is_teacher, bio from users
			where uid=${uid}
		`,
	);

	if (!user) return redirect(302, "/login");

	const tags: Pick<SelectTag, "name">[] = await db.execute(sql`
		select name from users
		join user_to_tag
		on users.uid=user_uid
		join tags
		on tags.id=tag_id
		where user_uid=${uid}
	`);

	return {
		user: {
			username: locals.user.username,
			email: user.email,
			isTeacher: !!user.is_teacher,
			bio: user.bio,
			tags: tags.map((t) => t.name),
		},
	};
};

export const actions: Actions = {
	update: formgate(
		UpdateProfileSchema,
		async (data, { locals }) => {
			const uid = locals.user?.uid;
			if (!uid) throw redirect(301, "/login");

			await db
				.update(users)
				.set({
					is_teacher: data.isTeacher,
					username: data.username,
					bio: data.bio,
				})
				.where(eq(users.uid, uid));

			// Remove old review preferences
			await db.execute(sql`
				delete from user_to_tag
				where user_uid=${uid}
			`);

			const tagIds: { id: number }[] = await db.execute(sql`
					select id from tags
					where name in ${data.level}
				`);

			// Update entry tags
			await db
				.insert(userToTag)
				.values(tagIds.map(({ id }) => ({ userUid: uid, tagId: id })))
				.onConflictDoNothing();

			return { data };
		},
		{ id: "update" },
	),
	delete: formgate(
		DeleteProfileSchema,
		async (data, event) => {
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

			await db.delete(users).where(eq(users.uid, locals.user.uid));

			event.setHeaders({ "Clear-Site-Data": "*" });

			return redirect(303, "/");
		},
		{ id: "delete" },
	),
};
