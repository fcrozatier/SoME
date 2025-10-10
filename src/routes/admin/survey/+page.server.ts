import { currentYear } from "$lib/config";
import { db } from "$lib/server/db";
import { type SelectSurveys } from "$lib/server/db/schema";
import { SurveyFilterSchema } from "$lib/validation";
import type { Actions } from "@sveltejs/kit";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";

export const load = async ({ locals }) => {
	if (!locals.user?.isAdmin) return error(404);

	const surveys: Pick<SelectSurveys, "some" | "site" | "feedback" | "json">[] =
		await db.execute(sql`
			select "some", site, feedback, json
			from surveys
			where date_part('year', created_at)=${currentYear};
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
