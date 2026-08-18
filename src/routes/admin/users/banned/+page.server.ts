import { assertIsAdmin } from "$lib/server/authorization.js";
import { db } from "$lib/server/db";
import { type SelectBan } from "$lib/server/db/schema";
import type { Prettify } from "@fcrozatier/ts-helpers";
import { sql } from "drizzle-orm";

export const load = async ({ locals }) => {
	assertIsAdmin(locals);

	const bannedUsers: Prettify<
		Pick<SelectBan, "reason" | "message"> & {
			username: string;
			expires_at: string;
		}
	>[] = await db.execute(sql`
				select username, reason, message, expires_at from bans
				join users on user_uid=users.uid
				where now() < expires_at;
		`);

	return { bannedUsers };
};
