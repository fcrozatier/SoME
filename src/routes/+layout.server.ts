import { db } from "$lib/server/db/index.js";
import { sql } from "drizzle-orm";

export const load = async ({ locals, cookies }) => {
	// const uid = locals.user?.uid;

	// let surveyTaken: boolean = cookies.get("survey") === "true";

	// if (!surveyTaken && uid) {
	// 	const rows = await db.execute(sql`
	// 			select surveys.created_at from surveys join users
	// 			on surveys.user_uid=users.uid
	// 			where users.uid=${uid}
	// 			and date_part('year', surveys.created_at)='2025';
	// 		`);

	// 	if (rows.length > 0) {
	// 		surveyTaken = true;
	// 	}
	// }

	return { ...locals };
};
