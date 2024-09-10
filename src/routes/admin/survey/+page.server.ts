import { db } from '$lib/server/db/client';
import { type SelectSurveys } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export const load = async () => {
	const surveys: (Pick<SelectSurveys, 'some' | 'site' | 'feedback'> & { off_season: boolean })[] =
		await db.execute(sql`
			select "some", site, off_season, feedback
			from surveys
			where date_part('year', created_at)='2024';
		`);

	return { surveys };
};
