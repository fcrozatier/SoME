import { MODERATION_PROMPT, OPENAI_API_KEY, OPENAI_PROJECT } from "$env/static/private";
import type { Category } from "$lib/config";
import { query1 } from "$lib/server/algo/queries";
import { db } from "$lib/server/db";
import { cache, flags, type SelectEntry, skips, votes } from "$lib/server/db/schema";
import { voteOpen } from "$lib/utils/time";
import { FlagSchema, SkipSchema, VoteSchema } from "$lib/validation";
import { fail, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import { formgate } from "formgator/sveltekit";
import { OpenAI } from "openai";
import type postgres from "postgres";

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
	project: OPENAI_PROJECT,
});

export const load = async ({ locals, params }) => {
	if (!locals.user) {
		return redirect(302, "/login");
	}

	if (!voteOpen()) {
		return redirect(302, "/user/vote/");
	}

	const { category } = params;
	const token = locals.user.uid;

	const result: postgres.RowList<SelectEntry[]> = await db.execute(query1(token, category));

	if (!result) return { stopVote: true };

	const [entry] = result;

	if (entry) {
		await db
			.insert(cache)
			.values({
				category: entry.category,
				entryUid: entry.uid,
				userUid: token,
			})
			.onConflictDoUpdate({
				target: [cache.userUid, cache.category],
				set: { entryUid: entry.uid },
			});

		return {
			title: entry.title,
			description: entry.description,
			category: entry.category,
			url: entry.url,
			thumbnail: entry.thumbnail,
			uid: entry.uid,
		};
	}

	return { stopVote: true };
};

export const actions = {
	flag: formgate(FlagSchema, async (data, { params, locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}
		const token = locals.user.uid;
		const { category } = params;

		await db
			.insert(flags)
			.values({
				entryUid: data.uid,
				userUid: token,
				reason: data.reason,
			})
			.onConflictDoNothing();

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));
	}),
	vote: formgate(VoteSchema, async (data, { params, locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}
		const token = locals.user.uid;
		const { category } = params;

		let maybe_rude = false;

		if (data.feedback) {
			const completion = await openai.chat.completions.create({
				model: "gpt-4",
				temperature: 0.2,
				messages: [
					{
						role: "system",
						content: MODERATION_PROMPT,
					},
					{
						role: "user",
						content: data.feedback,
					},
				],
			});

			maybe_rude = completion.choices[0]?.message.content?.match(/OK|REVIEW/g)?.at(-1) === "REVIEW";
		}

		await db
			.insert(votes)
			.values({
				entryUid: data.uid,
				userUid: token,
				score: data.score.toString(),
				feedback: data.feedback,
				maybe_rude,
			})
			.onConflictDoUpdate({
				target: [votes.userUid, votes.entryUid],
				set: {
					score: `${data.score}`,
					feedback: data.feedback,
				},
			});

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));
	}),
	hard_skip: formgate(SkipSchema, async (data, { params, locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}

		const token = locals.user.uid;
		const { category } = params;

		await db
			.insert(skips)
			.values({
				entryUid: data.uid,
				userUid: token,
			})
			.onConflictDoNothing();

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));
	}),
	skip: formgate(SkipSchema, async (data, { params, locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}
		const token = locals.user.uid;
		const { category } = params;

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));
	}),
};
