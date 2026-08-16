import { OPENAI_API_KEY, OPENAI_PROJECT } from "$env/static/private";
import { OpenAI } from "openai";

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
	project: OPENAI_PROJECT,
});

export const maybeRude = async (input: string) => {
	try {
		const moderation = await openai.moderations.create({
			model: "omni-moderation-latest",
			input,
		});

		return moderation.results[0]?.flagged ?? true;
	} catch (error) {
		console.log("[moderation error]:", error);
		return true;
	}
};
