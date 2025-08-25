import { OpenAI } from "openai";
import { MODERATION_PROMPT, OPENAI_API_KEY, OPENAI_PROJECT } from "$env/static/private";

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
	project: OPENAI_PROJECT,
});

export const maybeRude = async (content: string) => {
	const completion = await openai.chat.completions.create({
		model: "gpt-4.1-nano",
		temperature: 0.2,
		messages: [
			{
				role: "system",
				content: MODERATION_PROMPT,
			},
			{
				role: "user",
				content,
			},
		],
	});

	return completion.choices[0]?.message.content?.match(/OK|REVIEW/g)?.at(-1) === "REVIEW";
};
