import { assertIsAdmin } from "$lib/server/authorization.js";
import { db } from "$lib/server/db";
import { type SelectEntry, type User } from "$lib/server/db/schema";
import type { Prettify } from "@fcrozatier/ts-helpers";
import { sql } from "drizzle-orm";

export const load = async ({ locals }) => {
	assertIsAdmin(locals);

	const deletedUsers: Prettify<
		Pick<User, "uid" | "username"> & {
			/**
			 * When was the entry deleted
			 */
			deleted_at: SelectEntry["deletedAt"];
		}
	>[] = await db.execute(sql`
				select uid, username, deleted_at
				from users
				where deleted_at is not null;
		`);

	return { deletedUsers };
};
