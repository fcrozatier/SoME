import { feedbacks as queryFeedbacks } from '$lib/server/algo/queries';
import { db } from '$lib/server/db/client';
import { FeedbackSchema, validateForm } from '$lib/server/validation';
import { fail, type Actions } from '@sveltejs/kit';
import type postgres from 'postgres';
import { z } from 'zod';

export const load = async (event) => {
	const { token } = event.params;

	const feedbacks: postgres.RowList<
		{ entry_uid: string; title: string; score: number; feedback: string }[]
	> = await db.execute(queryFeedbacks(token));

	const groups = Object.groupBy(feedbacks, (item) => item.title);
	console.log('feedbacks:', feedbacks);
	console.log('groups:', groups);
	return { groups };
};

const SurveySchema = z.object({
	some: z.string().pipe(z.coerce.number()),
	site: z.string().pipe(z.coerce.number()),
	feedback: FeedbackSchema,
});

// export const actions: Actions = {
// 	default: async ({ request, params }) => {
// 		const { token } = params;

// 		const validation = await validateForm(request, SurveySchema);

// 		if (!validation.success) {
// 			const fieldErrors = validation.error.flatten()['fieldErrors'];
// 			const reasons = Object.values(fieldErrors).flat();
// 			const listFormatter = new Intl.ListFormat('en', { type: 'conjunction', style: 'short' });

// 			return fail(400, { surveyFail: true, reason: listFormatter.format(reasons) });
// 		}

// 		const session = driver.session();
// 		try {
// 			await session.executeWrite((tx) => {
// 				return tx.run(
// 					`
// 					MATCH (u:User)
// 					WHERE u.token = $token
// 					CREATE (u)-[:SENT]->(s:Survey)
// 					SET s.some = $data.some
// 					SET s.site = $data.site
// 					SET s.feedback = $data.feedback
// 					RETURN u
// 			`,
// 					{
// 						token,
// 						data: validation.data,
// 					},
// 				);
// 			});

// 			return { surveySuccess: true };
// 		} catch (error) {
// 			console.log(error);
// 			return fail(400, { surveyFail: true, reason: null });
// 		} finally {
// 			await session.close();
// 		}
// 	},
// };
