import { voteOpen, YOUTUBE_EMBEDDABLE } from '$lib/utils';
import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { FlagSchema, validateForm, VoteSchema } from '$lib/server/validation';
import { db } from '$lib/server/db/client';
import { entries, votes } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import type { Category } from '$lib/config';
import { decrypt, encrypt } from '$lib/server/encryption';

export const load: PageServerLoad = async (event) => {
	const { token, category } = event.params;

	if (!voteOpen()) {
		throw redirect(302, `/vote/${token}`);
	}

	const entry = (
		await db
			.select()
			.from(entries)
			.where(and(eq(entries.category, category as Category), eq(entries.active, true)))
			.limit(1)
	)[0];

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

	return { stopVote: true };
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
