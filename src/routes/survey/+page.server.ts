import { MAX_AGE } from "$lib/server/config";
import { db } from "$lib/server/db";
import { surveys } from "$lib/server/db/schema";
import { SurveySchema } from "$lib/validation";
import { type Actions, redirect } from "@sveltejs/kit";
import { formgate } from "formgator/sveltekit";

export const load = async () => {
	return redirect(302, "/");
};

export const actions: Actions = {
	default: formgate(SurveySchema, async (data, { cookies }) => {
		const token = cookies.get("token");

		await db.insert(surveys).values({
			userUid: token,
			some: data.some.toString(),
			site: data.site.toString(),
			feedback: data.feedback,
		});

		cookies.set("survey", "true", {
			path: "/",
			maxAge: MAX_AGE,
		});

		return { surveySuccess: true };
	}),
};
