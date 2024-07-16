import { sendTemplate } from '$lib/server/email';
import type { Actions } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import { EmailTemplateSchema, validateForm } from '$lib/server/validation';
import { dev } from '$app/environment';

export const actions: Actions = {
	default: async ({ request }) => {
		try {
			const validation = await validateForm(request, EmailTemplateSchema);

			if (!validation.success) {
				console.log(validation.error.flatten());
				return fail(400, validation.error.flatten());
			}

			if (!dev) {
				// Fire and forget
				console.log('send template email');
				await sendTemplate(validation.data.template_name);
			}

			return { success: true };
		} catch (e) {
			console.error('Could not send template', e);
			return fail(500);
		}
	}
};
