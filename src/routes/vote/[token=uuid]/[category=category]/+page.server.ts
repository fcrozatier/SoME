import type { Category } from '$lib/config';
import { db } from '$lib/server/db/client';
import {
	cache,
	flags,
	skips,
	usersToEntries,
	votes,
	type SelectEntry
} from '$lib/server/db/schema';
import { decrypt, encrypt } from '$lib/server/encryption';
import { FlagSchema, SkipSchema, validateForm, VoteSchema } from '$lib/server/validation';
import { voteOpen } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import type postgres from 'postgres';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { token, category } = event.params;

	if (!voteOpen()) {
		throw redirect(302, `/vote/${token}`);
	}

	const result: postgres.RowList<SelectEntry[]> = await db.execute(sql`
			with cached as (
				select entry_uid
				from cache join entries on cache.entry_uid=entries.uid
				where user_uid=${token}
				and category=${category}
				and active='true'
			),

			total as (
				select entry_uid, count(*) as count
				from (
					select entry_uid from votes
					union all
					select entry_uid from cache
					) as summation
				group by entry_uid
			)

			select uid, title, description, entries.category, url, thumbnail, total.count
			from entries
			join total
			on entries.uid=total.entry_uid

			where
				case when (select count(*) > 0 from cached)
				then
					entries.uid=cached.entry_uid
				else
					category=${category}
					and active='true'
					and uid not in (select entry_uid from votes where votes.user_uid=${token})
					and uid not in (select entry_uid from skips where skips.user_uid=${token})
					and uid not in (select entry_uid from flags where flags.user_uid=${token})
					and uid not in (select entry_uid from ${usersToEntries} where ${usersToEntries.userUid}=${token})
				end

			order by total.count
			limit 1;
		`);

	if (!result) return { stopVote: true };

	const [entry] = result;

	if (entry) {
		const { cipherText, tag } = encrypt(entry.uid);

		await db
			.insert(cache)
			.values({
				category: entry.category,
				entryUid: entry.uid,
				userUid: token
			})
			.onConflictDoUpdate({
				target: [cache.userUid, cache.category],
				set: { entryUid: entry.uid }
			});

		return {
			title: entry.title,
			description: entry.description,
			category: entry.category,
			url: entry.url,
			thumbnail: entry.thumbnail,
			uid: cipherText,
			tag
		};
	}

	return { stopVote: true };
};

let id: 'FLAG' | 'VOTE' | 'SKIP' | 'HARD_SKIP';

export const actions: Actions = {
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
					reason: validation.data.reason
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
		const { token } = params;
		const validation = await validateForm(request, VoteSchema);

		if (!validation.success) {
			console.log(validation.error.flatten());
			return fail(400, { id, voteFail: true });
		}

		try {
			const uid = decrypt(validation.data.uid, validation.data.tag);

			await db
				.insert(votes)
				.values({
					entryUid: uid,
					userUid: token,
					score: validation.data.score,
					feedback: validation.data.feedback
				})
				.onConflictDoUpdate({
					target: [votes.userUid, votes.entryUid],
					set: { score: `${validation.data.score}`, feedback: validation.data.feedback }
				});

			return { id, voteSuccess: true };
		} catch (error) {
			console.log('error:', error);
			return fail(400, { id, voteFail: true });
		}
	},
	hard_skip: async ({ request, params }) => {
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
					userUid: token
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
	skip: async ({ params }) => {
		id = 'SKIP';
		const { token, category } = params;

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));

		return { id, skipSuccess: true };
	}
};
