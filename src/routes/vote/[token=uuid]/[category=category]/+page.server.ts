import { MODERATION_PROMPT, OPENAI_API_KEY, OPENAI_PROJECT } from '$env/static/private';
import type { Category } from '$lib/config';
import { query3 } from '$lib/server/algo/queries';
import { db } from '$lib/server/db/client';
import { cache, flags, skips, votes, type SelectEntry } from '$lib/server/db/schema';
import { decrypt, encrypt } from '$lib/server/encryption';
import { FlagSchema, SkipSchema, validateForm, VoteSchema } from '$lib/server/validation';
import { voteOpen } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { OpenAI } from 'openai';
import type postgres from 'postgres';
import { action } from './config';

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
	project: OPENAI_PROJECT,
});

export const load = async (event) => {
	const { token, category } = event.params;

	if (!voteOpen()) {
		redirect(302, `/vote/${token}`);
	}

	const result: postgres.RowList<(SelectEntry & { total_votes: number })[]> = await db.execute(
		query3(token, category),
	);

	if (!result) return { stopVote: true };

	const [entry] = result;

	if (entry) {
		const { cipherText, tag } = encrypt(entry.uid);

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
			uid: cipherText,
			total_votes: entry.total_votes,
			tag,
		};
	}

	return { stopVote: true };
};

let id: 'FLAG' | 'VOTE' | 'SKIP' | 'HARD_SKIP';

export const actions = {
	flag: async ({ request, params }) => {
		id = 'FLAG';
		const { token, category } = params;

		const validation = await validateForm(request, FlagSchema);
		if (!validation.success) {
			console.log(validation.error.flatten());
			return fail(400, { id, flagFail: true });
		}

		try {
			const uid = decrypt(validation.data.uid, validation.data.tag);

			await db
				.insert(flags)
				.values({
					entryUid: uid,
					userUid: token,
					reason: validation.data.reason,
				})
				.onConflictDoNothing();

			await db
				.delete(cache)
				.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));

			return { id, flagSuccess: true };
		} catch (error) {
			console.log('error:', error);
			return fail(400, { id, flagFail: true });
		}
	},
	vote: async ({ request, params }) => {
		id = 'VOTE';
		const { token, category } = params;
		const validation = await validateForm(request, VoteSchema);

		if (!validation.success) {
			console.log(validation.error.flatten());
			return fail(400, { id, voteFail: true });
		}

		let maybe_rude = false;

		if (validation.data.feedback) {
			const completion = await openai.chat.completions.create({
				model: 'gpt-4',
				temperature: 0.2,
				messages: [
					{
						role: 'system',
						content: MODERATION_PROMPT,
					},
					{
						role: 'user',
						content: validation.data.feedback,
					},
				],
			});

			maybe_rude = completion.choices[0].message.content?.match(/OK|REVIEW/g)?.at(-1) === 'REVIEW';
		}

		try {
			const uid = decrypt(validation.data.uid, validation.data.tag);

			await db
				.insert(votes)
				.values({
					entryUid: uid,
					userUid: token,
					score: validation.data.score.toString(),
					feedback: validation.data.feedback,
					maybe_rude,
				})
				.onConflictDoUpdate({
					target: [votes.userUid, votes.entryUid],
					set: { score: `${validation.data.score}`, feedback: validation.data.feedback },
				});

			await db
				.delete(cache)
				.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));

			return { id, voteSuccess: true };
		} catch (error) {
			console.log('error:', error);
			return fail(400, { id, voteFail: true });
		}
	},
	[action.hard_skip]: async ({ request, params }) => {
		id = 'HARD_SKIP';
		const { token, category } = params;
		const validation = await validateForm(request, SkipSchema);

		if (!validation.success) {
			console.log(validation.error.flatten());
			return fail(400, { id, skipFail: true });
		}

		try {
			const uid = decrypt(validation.data.uid, validation.data.tag);

			await db
				.insert(skips)
				.values({
					entryUid: uid,
					userUid: token,
				})
				.onConflictDoNothing();

			await db
				.delete(cache)
				.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));

			return { id, skipSuccess: true };
		} catch (error) {
			console.log('error:', error);
			return fail(400, { id, skipFail: true });
		}
	},
	[action.skip]: async ({ params }) => {
		id = 'SKIP';
		const { token, category } = params;

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));

		return { id, skipSuccess: true };
	},
};
