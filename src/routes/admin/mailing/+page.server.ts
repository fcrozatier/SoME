import { dev } from "$app/environment";
import { sendTemplate } from "$lib/server/email";
import { EmailTemplateSchema } from "$lib/validation";
import type { Actions } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { formgate } from "formgator/sveltekit";

export const actions: Actions = {
	default: formgate(EmailTemplateSchema, async (data) => {
		try {
			if (!dev) {
				console.log("Sending email template...");
				await sendTemplate(data.template_name);
			}

			return { success: true };
		} catch (e) {
			console.error("Couldn't send email", e);
			return fail(500);
		}
	}),
};
