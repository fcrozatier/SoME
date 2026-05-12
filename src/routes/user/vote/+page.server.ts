import { currentYear } from "$lib/config.js";
import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

export const load = async ({ locals }) => {
	const uid = locals.user?.uid;
	if (!uid) redirect(302, "/login");

	const [userVotes, userPreferences]: { count: string }[] = await db.execute(
		sql`
			select count(*) from votes
			where user_uid=${uid} and date_part('year', created_at)=${currentYear}
			union all
			select count(*) from user_to_tag
			where user_uid=${uid};
    `,
	);

	return {
		firstVote: Number(userVotes?.count) === 0,
		hasPreferences: Number(userPreferences?.count) > 0,
	};
};
