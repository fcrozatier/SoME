import { dev } from "$app/environment";
import { type Category, currentYear } from "$lib/config";
import { query2, query4 } from "$lib/server/algo/queries";
import { db } from "$lib/server/db";
import {
	cache,
	flags,
	type SelectEntry,
	skips,
	userToWatchlist,
	votes,
} from "$lib/server/db/schema";
import type { SelectCache, SelectTag } from "$lib/server/db/schema.js";
import { maybeRude } from "$lib/server/moderation.js";
import { parseAndSanitizeMarkdown } from "$lib/utils/markdown.js";
import { voteOpen } from "$lib/utils/time";
import { CacheVoteSchema, FlagSchema, SkipSchema, VoteSchema } from "$lib/validation";
import { redirect } from "@sveltejs/kit";
import { and, eq, sql } from "drizzle-orm";
import { formfail, formgate } from "formgator/sveltekit";

async function getEntryTags(entryUid: string): Promise<string[]> {
	const entryTags: Pick<SelectTag, "name">[] = await db.execute(sql`
		select name from tags
		inner join entry_to_tag on tag_id=id
		where entry_uid=${entryUid};
	`);
	return entryTags.map((t) => t.name);
}

export const load = async ({ locals, params }) => {
	if (!locals.user) {
		return redirect(302, "/login");
	}

	if (!voteOpen()) {
		return redirect(302, "/user/vote/");
	}

	const { category } = params;
	const userUid = locals.user.uid;
	const entryUid = params.entryUid;

	const isCreator =
		(
			await db.execute(sql`
			select entry_uid
			from user_to_entry
			join entries on uid=entry_uid
			where user_uid=${userUid}
			and date_part('year', created_at)=${currentYear};
		`)
		).count > 0;

	if (entryUid) {
		const isInWatchlist =
			(
				await db.execute(sql`
			select * from user_to_watchlist
			where user_uid=${userUid}
			and entry_uid=${entryUid}
			and date_part('year', created_at)=${currentYear}
			`)
			).count > 0;

		if (isInWatchlist) {
			const [entry]: Pick<
				SelectEntry,
				"uid" | "title" | "description" | "category" | "url" | "thumbnail"
			>[] = await db.execute(sql`
					select uid, title, description, category, url, thumbnail
					from entries
					where uid=${entryUid}
				`);

			const tags = await getEntryTags(entryUid);

			return {
				...entry,
				score: null,
				tags,
				isCreator,
			};
		}
	}

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
		const tags = await getEntryTags(cachedEntry.uid);

		return {
			...cachedEntry,
			score: cachedEntry.score ? Number(cachedEntry.score) : null,
			tags,
			isCreator,
		};
	}

	// let entry:
	// 	| Pick<SelectEntry, "uid" | "title" | "description" | "category" | "url" | "thumbnail">
	// 	| undefined;

	// const [entry4]: Pick<
	// 	SelectEntry,
	// 	"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	// >[] = await db.execute(query4(userUid, category));
	// entry = entry4;

	// if (entry4) {
	// 	console.log("[vote]: found top entry with few votes", entry4);
	// } else {
	// 	console.log("[vote]: didn't found top entry with few votes");
	// }
	const [entry]: Pick<
		SelectEntry,
		"uid" | "title" | "description" | "category" | "url" | "thumbnail"
	>[] = await db.execute(query2(userUid, category));

	if (entry) {
		await db.insert(cache).values({
			userUid: userUid,
			category: entry.category,
			entryUid: entry.uid,
		});

		const tags = await getEntryTags(entry.uid);

		return {
			...entry,
			score: null,
			tags,
			isCreator,
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
		const userUid = locals.user.uid;
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
				userUid: userUid,
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
			.where(and(eq(cache.userUid, userUid), eq(cache.category, category as Category)));

		await db
			.delete(userToWatchlist)
			.where(and(eq(userToWatchlist.userUid, userUid), eq(userToWatchlist.entryUid, data.uid)));

		console.log("[new vote]");
		return redirect(303, `/user/vote/${category}`);
	}),
	watchlist: formgate(SkipSchema, async (data, { params, locals }) => {
		if (!locals.user) {
			return redirect(302, "/login");
		}

		const userUid = locals.user.uid;
		const { category } = params;

		await db
			.insert(userToWatchlist)
			.values({
				userUid: userUid,
				entryUid: data.uid,
			})
			.onConflictDoNothing();

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, userUid), eq(cache.category, category as Category)));

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
		const userUid = locals.user.uid;
		const { category } = params;

		await db
			.insert(skips)
			.values({
				userUid: userUid,
				entryUid: data.uid,
			})
			.onConflictDoNothing();

		await db
			.delete(cache)
			.where(and(eq(cache.userUid, userUid), eq(cache.category, category as Category)));

		await db
			.delete(userToWatchlist)
			.where(and(eq(userToWatchlist.userUid, userUid), eq(userToWatchlist.entryUid, data.uid)));

		return redirect(303, `/user/vote/${category}`);
	}),
};
