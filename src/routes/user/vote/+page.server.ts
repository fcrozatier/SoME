import { CURRENT_YEAR } from "$lib/constants.js";
import { assertIsLoggedIn } from "$lib/server/authorization.js";
import { db } from "$lib/server/db";
import { sql } from "drizzle-orm";

export const load = async ({ locals }) => {
	assertIsLoggedIn(locals);
	const uid = locals.user?.uid;

	const [userVotes, userPreferences]: { count: number }[] = await db.execute(
		sql`
			select count(*)::int from votes
			where user_uid=${uid} and date_part('year', created_at)=${CURRENT_YEAR}
			union all
			select count(*)::int from user_to_tag
			where user_uid=${uid};
    `,
	);

	const [nbEntries]: { count: number }[] = await db.execute(sql`
			select count(*)::int from entries
			where date_part('year', created_at)=${CURRENT_YEAR};
		`);

	return {
		firstVote: userVotes?.count === 0,
		hasPreferences: userPreferences?.count !== 0,
		nbEntries: nbEntries?.count,
	};
};
