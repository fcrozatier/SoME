import { queryFeedbacks } from '$lib/server/algo/queries';
import { db } from '$lib/server/db/client';
import { surveys } from '$lib/server/db/schema.js';
import { FeedbackSchema, validateForm } from '$lib/server/validation';
import { fail, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type postgres from 'postgres';
import { z } from 'zod';

export const load = async (event) => {
	const { token } = event.params;

	const feedbacks: postgres.RowList<
		{ entry_uid: string; title: string; score: number; median: number; feedback: string }[]
	> = await db.execute(queryFeedbacks(token));

	const groups = Object.groupBy(feedbacks, (item) => item.title);

	const surveyTaken =
		(await db.select().from(surveys).where(eq(surveys.userUid, token))).length > 0;

	return { groups, surveyTaken };
};

const SurveySchema = z.object({
	some: z.string(),
	site: z.string(),
	feedback: FeedbackSchema,
});

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { token } = params;

		const validation = await validateForm(request, SurveySchema);

		if (!token) return fail(400, { surveyFail: true, reason: 'User not found' });

		if (!validation.success) {
			const fieldErrors = validation.error.flatten()['fieldErrors'];
			const reasons = Object.values(fieldErrors).flat();
			const listFormatter = new Intl.ListFormat('en', { type: 'conjunction', style: 'short' });

			return fail(400, { surveyFail: true, reason: listFormatter.format(reasons) });
		}

		try {
			await db.insert(surveys).values({
				userUid: token,
				...validation.data,
			});

			return { surveySuccess: true };
		} catch (error) {
			console.log(error);
			return fail(400, { surveyFail: true, reason: null });
		}
	},
};
