import { queryFeedbacks } from "$lib/server/algo/queries";
import { db } from "$lib/server/db";
import { surveys } from "$lib/server/db/schema.js";
import { eq } from "drizzle-orm";

export const load = async (event) => {
	const { token } = event.params;

	const feedbacks: {
		entry_uid: string;
		title: string;
		score: number;
		median: number;
		feedback: string;
		maybe_rude: boolean;
	}[] = await db.execute(queryFeedbacks(token));

	const groups = Object.groupBy(feedbacks, (item) => item.title);

	const surveyTaken =
		(await db.select().from(surveys).where(eq(surveys.userUid, token))).length > 0;

	return { groups, surveyTaken };
};
