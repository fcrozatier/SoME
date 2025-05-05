import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load = async ({ params }) => {
	await db.update(users)
		.set({ passwordHash: users.newPasswordHash })
		.where(eq(users.newPasswordValidationToken, params.token));
};
