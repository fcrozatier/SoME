import { dev } from "$app/environment";
import type { Category } from "$lib/config";
import { query3 } from "$lib/server/algo/queries";
import { db } from "$lib/server/db";
import { cache, flags, type SelectEntry, skips, votes } from "$lib/server/db/schema";
import type { SelectCache, SelectTag } from "$lib/server/db/schema.js";
import { maybeRude } from "$lib/server/moderation.js";
import { parseAndSanitizeMarkdown } from "$lib/utils/markdown.js";
import { voteOpen } from "$lib/utils/time";
import { CacheVoteSchema, FlagSchema, SkipSchema, VoteSchema } from "$lib/validation";
import { redirect } from "@sveltejs/kit";
import { and, eq, sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";

export const load = async ({ locals, params }) => {
	if (!locals.user) {
		return redirect(302, "/login");
	}

	if (!voteOpen()) {
		return redirect(302, "/user/vote/");
	}

	const { category } = params;
	const userUid = locals.user.uid;

	const [cachedEntry]: (Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	> &
		Pick<SelectCache, "score" | "feedback_unsafe_md">)[] = await db.execute(sql`
			select uid, title, description, entries.category, url, thumbnail, score, feedback_unsafe_md
			from cache join entries on cache.entry_uid=entries.uid
			where cache.user_uid=${userUid}
			and cache.category=${category}
		`);

	if (cachedEntry) {
		const entryTags: Pick<SelectTag, "name">[] = await db.execute(sql`
			select name from tags
			inner join entry_to_tag on tag_id=id
			where entry_uid=${cachedEntry.uid};
		`);
		return {
			...cachedEntry,
			score: cachedEntry.score ? Number(cachedEntry.score) : null,
			tags: entryTags.map((t) => t.name),
		};
	}
	const [entry]: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	>[] = await db.execute(query3(userUid, category));

	if (entry) {
		await db.insert(cache).values({
			userUid: userUid,
			category: entry.category,
			entryUid: entry.uid,
		});

		const entryTags: Pick<SelectTag, "name">[] = await db.execute(sql`
			select name from tags
			inner join entry_to_tag on tag_id=id
			where entry_uid=${entry.uid};
		`);

		return {
			title: entry.title,
			description: entry.description,
			category: entry.category,
			url: entry.url,
			thumbnail: entry.thumbnail,
			uid: entry.uid,
			tags: entryTags.map((t) => t.name),
		};
	}

	return { stopVote: true };
};

export const actions = {
	flag: formgate(FlagSchema, async (data, event) => {
		if (!event.locals.user) {
			return redirect(302, "/login");
		}
		const uid = event.locals.user.uid;

		if (data.vote) {
			if (!data.score) {
				return formfail({
					vote: "Please grade the entry first",
				});
			}

			let maybe_rude = false;

			if (!dev && data.feedback && Math.random() > 0.5) {
				maybe_rude = await maybeRude(data.feedback);
			}

			const feedbackSafe = await parseAndSanitizeMarkdown(data.feedback);

			await db
				.insert(votes)
				.values({
					entryUid: data.uid,
					userUid: uid,
					score: String(data.score),
					feedback: feedbackSafe,
					feedback_unsafe_md: data.feedback,
					maybe_rude,
				})
				.onConflictDoUpdate({
					target: [votes.userUid, votes.entryUid],
					set: {
						score: String(data.score),
						feedback: feedbackSafe,
						feedback_unsafe_md: data.feedback,
					},
				});
		}

		await db
			.insert(flags)
			.values({
				entryUid: data.uid,
				userUid: uid,
				reason: data.reason,
			})
			.onConflictDoNothing();

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, uid), eq(cache.category, event.params.category as Category)));

		return { success: true };
	}),
	vote: formgate(VoteSchema, async (data, { params, locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}
		const token = locals.user.uid;
		const { category } = params;

		let maybe_rude = false;

		if (!dev && data.feedback && Math.random() > 0.5) {
			maybe_rude = await maybeRude(data.feedback);
		}

		const feedbackSafe = await parseAndSanitizeMarkdown(data.feedback);

		await db
			.insert(votes)
			.values({
				entryUid: data.uid,
				userUid: token,
				score: String(data.score),
				feedback: feedbackSafe,
				feedback_unsafe_md: data.feedback,
				maybe_rude,
			})
			.onConflictDoUpdate({
				target: [votes.userUid, votes.entryUid],
				set: {
					score: String(data.score),
					feedback: feedbackSafe,
					feedback_unsafe_md: data.feedback,
				},
			});

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, token), eq(cache.category, category as Category)));

		console.log("[new vote]");
		return redirect(303, `/user/vote/${category}`);
	}),
	cache: formgate(CacheVoteSchema, async (data, { params, locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}

		await db.execute(sql`
			update cache
				set score=${data.score}, feedback_unsafe_md=${data.feedback}
				where user_uid=${locals.user.uid}
				and category=${params.category}
		`);

		return { success: true };
	}),
	skip: formgate(SkipSchema, async (data, { params, locals }) => {
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

		return redirect(303, `/user/vote/${category}`);
	}),
};
