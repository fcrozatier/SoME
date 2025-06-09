import { conjunctionFormatter } from "$lib/config.js";
import { db } from "$lib/server/db/index.js";
import { nonTags } from "$lib/server/db/schema.js";
import { dictionary } from "$lib/utils/dictionary.server";
import { slugify } from "$lib/utils/slugify";
import { json } from "@sveltejs/kit";
import z from "zod";

const tagSchema = z.object({
	tag: z.string(),
});

export const POST = async ({ request }) => {
	const data = await request.json();
	const validation = tagSchema.safeParse(data);

	if (!validation.success) {
		return json(
			{
				valid: false,
				reason: "Unexpected data",
			},
			{ status: 400 },
		);
	}

	const { tag } = validation.data;
	const slug = slugify(tag);
	const unknownWords = slug.split("-").filter((part) => !dictionary.has(part));

	if (unknownWords.length) {
		// Save attempted tags
		await db.insert(nonTags).values({ name: tag }).onConflictDoNothing();

		return json(
			{
				valid: false,
				reason: `Unknown word${unknownWords.length === 1 ? "" : "s"}: ${conjunctionFormatter.format(
					unknownWords,
				)}`,
			},
			{ status: 400 },
		);
	}

	return json({ valid: true });
};
