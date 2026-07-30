import { CURRENT_YEAR } from "$lib/constants.js";
import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

const [nbEntries]: { count: string }[] = await db.execute(sql`
		select count(*) from entries
		where date_part('year', created_at)=${CURRENT_YEAR};
	`);

export const load = async ({ locals }) => {
	const uid = locals.user?.uid;
	if (!uid) redirect(302, "/login");

	const [userVotes, userPreferences]: { count: string }[] = await db.execute(
		sql`
			select count(*) from votes
			where user_uid=${uid} and date_part('year', created_at)=${CURRENT_YEAR}
			union all
			select count(*) from user_to_tag
			where user_uid=${uid};
    `,
	);

	return {
		firstVote: Number(userVotes?.count) === 0,
		hasPreferences: Number(userPreferences?.count) > 0,
		nbEntries: Number(nbEntries?.count),
	};
};
