import { db } from '$lib/server/db/client';
import { usersToEntries, votes, type SelectEntry } from '$lib/server/db/schema';
import { decrypt, encrypt } from '$lib/server/encryption';
import { FlagSchema, validateForm, VoteSchema } from '$lib/server/validation';
import { voteOpen } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import { sql } from 'drizzle-orm';
import type postgres from 'postgres';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { token, category } = event.params;

	if (!voteOpen()) {
		throw redirect(302, `/vote/${token}`);
	}

	const result: postgres.RowList<SelectEntry[]> = await db.execute(sql`
		select * from entries
		where category=${category}
		and active='true'
		and uid not in (select entry_uid from ${usersToEntries} where ${usersToEntries.userUid}=${token})
		and uid not in (select entry_uid from votes where votes.user_uid=${token})
		limit 1;
		`);

	if (!result) return { stopVote: true };

	const [entry] = result;

	if (entry) {
		const { cipherText, tag } = encrypt(entry.uid);

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
};

let id: 'FLAG' | 'VOTE';

export const actions: Actions = {
	flag: async ({ request, locals }) => {
		id = 'FLAG';

		const validation = await validateForm(request, FlagSchema);
		if (!validation.success) {
			console.log(validation.error.flatten());
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
			return fail(400, { id, voteFail: true });
		}
	}
};
