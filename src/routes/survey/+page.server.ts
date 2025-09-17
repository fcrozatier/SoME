import { db } from "$lib/server/db";
import { surveys } from "$lib/server/db/schema";
import { SurveySchema } from "$lib/validation";
import { type Actions, redirect } from "@sveltejs/kit";
import { formgate } from "formgator/sveltekit";

export const load = async () => {
	// return redirect(302, "/");
};

export const actions: Actions = {
	default: formgate(SurveySchema, async (data, { locals, cookies }) => {
		const uid = locals.user?.uid;

		await db.insert(surveys).values({
			userUid: uid,
			some: data.some.toString(),
			site: data.site.toString(),
			feedback: data.feedback,
			json: JSON.stringify(data),
		});

		cookies.set("survey", "true", {
			path: "/",
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 30 * 4, // 4 month(s)
		});

		return redirect(303, "/");
	}),
};
