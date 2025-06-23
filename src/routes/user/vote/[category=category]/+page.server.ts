import { MODERATION_PROMPT, OPENAI_API_KEY, OPENAI_PROJECT } from "$env/static/private";
import type { Category } from "$lib/config";
import { query1 } from "$lib/server/algo/queries";
import { db } from "$lib/server/db";
import { cache, flags, type SelectEntry, skips, votes } from "$lib/server/db/schema";
import { voteOpen } from "$lib/utils/time";
import { FlagSchema, SkipSchema, VoteSchema } from "$lib/validation";
import { fail, redirect } from "@sveltejs/kit";
import { and, eq } from "drizzle-orm";
import * as fg from "formgator/sveltekit";
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

	const result: postgres.RowList<(SelectEntry & { total_votes: number })[]> = await db.execute(
		query1(token, category),
	);

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
			total_votes: entry.total_votes,
		};
	}

	return { stopVote: true };
};

let id: "FLAG" | "VOTE" | "SKIP" | "HARD_SKIP";

export const actions = {
	flag: fg.formgate(FlagSchema, async (data, { params, locals }) => {
		id = "FLAG";
		if (!locals.user) {
			return redirect(302, "/login");
		}
		const token = locals.user.uid;
		const { category } = params;

		try {
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

			return { id, flagSuccess: true };
		} catch (error) {
			console.log("error:", error);
			return fail(400, { id, flagFail: true });
		}
	}),
	vote: fg.formgate(VoteSchema, async (data, { params, locals }) => {
		id = "VOTE";
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

		try {
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

			return { id, voteSuccess: true };
		} catch (error) {
			console.log("[vote]:", error);
			return fail(400, { id, voteFail: true });
		}
	}),
	hard_skip: fg.formgate(SkipSchema, async (data, { params, locals }) => {
		id = "HARD_SKIP";
		if (!locals.user) {
			return redirect(302, "/login");
		}
		const token = locals.user.uid;
		const { category } = params;

		try {
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

			return { id, skipSuccess: true };
		} catch (error) {
			console.log("error:", error);
			return fail(400, { id, skipFail: true });
		}
	}),
	skip: fg.formgate(SkipSchema, async (data, { params, locals }) => {
		id = "SKIP";
		if (!locals.user) {
			return redirect(302, "/login");
		}
		const token = locals.user.uid;
		const { category } = params;

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));

		return { id, skipSuccess: true };
	}),
};
