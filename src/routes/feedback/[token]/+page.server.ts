import { driver } from '$lib/server/neo4j';
import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateForm, FeedbackSchema } from '$lib/server/validation';
import { z } from 'zod';

export const load: PageServerLoad = async (event) => {
	const { token } = event.params;

	const session = driver.session();

	try {
		// Find user's feedbacks
		const res = await session.executeRead((tx) => {
			return tx.run(
				`
				MATCH (u:User)
				WHERE u.token = $token
				WITH u
				OPTIONAL MATCH (u)-[:CREATED]->(:Entry)-[:FEEDBACK]->(f:Feedback)
				WITH u, f
				OPTIONAL MATCH (u)-[:SENT]->(s:Survey)
				RETURN collect(f.value) as feedbacks, s IS NOT NULL as surveyTaken
      `,
				{
					token
				}
			);
		});

		const feedbacks = (res?.records?.[0]?.get('feedbacks') ?? []) as string[];
		const surveyTaken = (res?.records?.[0]?.get('surveyTaken') ?? false) as boolean;
		console.log('surveyTaken:', surveyTaken, res.records[0]?.get('surveyTaken'));

		return { feedbacks, surveyTaken };
	} catch (error) {
		console.log(error);
		throw error;
	} finally {
		await session.close();
	}
};

const SurveySchema = z.object({
	some: z.string().pipe(z.coerce.number()),
	site: z.string().pipe(z.coerce.number()),
	feedback: FeedbackSchema
});

export const actions: Actions = {
	default: async ({ request, params }) => {
		const { token } = params;

		const validation = await validateForm(request, SurveySchema);

		if (!validation.success) {
			const fieldErrors = validation.error.flatten()['fieldErrors'];
			const reasons = Object.values(fieldErrors).flat();
			const listFormatter = new Intl.ListFormat('en', { type: 'conjunction', style: 'short' });

			return fail(400, { surveyFail: true, reason: listFormatter.format(reasons) });
		}

		const session = driver.session();
		try {
			await session.executeWrite((tx) => {
				return tx.run(
					`
					MATCH (u:User)
					WHERE u.token = $token
					CREATE (u)-[:SENT]->(s:Survey)
					SET s.some = $data.some
					SET s.site = $data.site
					SET s.feedback = $data.feedback
					RETURN u
			`,
					{
						token,
						data: validation.data
					}
				);
			});

			return { surveySuccess: true };
		} catch (error) {
			console.log(error);
			return fail(400, { surveyFail: true, reason: null });
		} finally {
			await session.close();
		}
	}
};
