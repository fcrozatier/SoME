import { assertIsAdmin } from "$lib/server/authorization";
import { CURRENT_YEAR } from "$lib/constants.js";
import { db } from "$lib/server/db";
import { type SelectSurveys } from "$lib/server/db/schema";
import { sql } from "drizzle-orm";

export const load = async ({ locals }) => {
	assertIsAdmin(locals);

	const surveys: Pick<SelectSurveys, "some" | "site" | "feedback" | "json">[] =
		await db.execute(sql`
			select "some", site, feedback, json
			from surveys
			where date_part('year', created_at)=${CURRENT_YEAR};
		`);

	return { surveys };
};

// export const actions: Actions = {
// 	filter: formgate(SurveyFilterSchema, async (data, { locals }) => {
// 		if (!locals.user?.isAdmin) return error(404);

// 		console.log(data);

// 		return { success: true };
// 	}),
// };
