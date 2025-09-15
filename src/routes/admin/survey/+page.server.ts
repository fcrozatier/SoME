import { currentYear } from "$lib/config";
import { db } from "$lib/server/db";
import { type SelectSurveys } from "$lib/server/db/schema";
import { error } from "@sveltejs/kit";
import { sql } from "drizzle-orm";

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
