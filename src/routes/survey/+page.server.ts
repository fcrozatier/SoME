import { MAX_AGE } from '$lib/server/config';
import { db } from '$lib/server/db/client';
import { surveys } from '$lib/server/db/schema';
import { FeedbackSchema, validateForm } from '$lib/server/validation';
import { fail, type Actions } from '@sveltejs/kit';
import { z } from 'zod';

const SurveySchema = z.object({
	some: z.string(),
	site: z.string(),
	feedback: FeedbackSchema,
});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const token = cookies.get('token');

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

			cookies.set('survey', 'true', {
				path: '/',
				maxAge: MAX_AGE,
			});

			return { surveySuccess: true };
		} catch (error) {
			console.log(error);
			return fail(400, { surveyFail: true, reason: null });
		}
	},
};
