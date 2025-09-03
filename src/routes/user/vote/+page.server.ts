import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async ({ locals }) => {
	const uid = locals.user?.uid;
	if (!uid) redirect(302, "/login");

	const [userCache, userPreferences]: { count: string }[] = await db.execute(
		sql`
      select count(*) from cache
      where user_uid=${uid}
      union all
      select count(*) from user_to_tag
      where user_uid=${uid};
    `,
	);

	return {
		firstVote: Number(userCache?.count) === 0,
		hasPreferences: Number(userPreferences?.count) > 0,
	};
};
