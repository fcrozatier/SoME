import { sql } from "drizzle-orm";
import { userToEntry } from "../db/schema";
import { CURRENT_YEAR, ENTRY_STATE } from "$lib/constants";
import { randomItem, round } from "@fcrozatier/ts-helpers";
import { voteTimeElapsedPercent } from "$lib/utils/time";

const entry_columns = "title, description, entries.category, url, thumbnail";

/**
 * Vote warmup phase
 *
 * Pick an entry at random from all entries with less than 4 votes and 12 skips
 */
export function voteWarmup(user_uid: string, category: string) {
	console.log("[vote]: warm up");

	return sql`
			with nb_votes as (
				select entry_uid, count(*)
				from votes
				where date_part('year', created_at)=${CURRENT_YEAR}
				group by entry_uid
			),

			nb_skips as (
				select entry_uid, count(*)
				from skips
				where date_part('year', created_at)=${CURRENT_YEAR}
				group by entry_uid
			),

			pool as (
				select distinct uid, ${sql.raw(entry_columns)}, coalesce(nb_skips.count, 0) as nb_skips_count,
					(4 - coalesce(nb_votes.count, 0)) as weight
				from entries
				left join nb_votes
				on entries.uid=nb_votes.entry_uid
				left join nb_skips
				on entries.uid=nb_skips.entry_uid
				left join entry_to_tag
				on entries.uid=entry_to_tag.entry_uid

				where date_part('year', entries.created_at)=${CURRENT_YEAR}
					and entries.category=${category}
					and entries.state in ${[ENTRY_STATE.Active, ENTRY_STATE.Flagged]}
					and deleted_at is null
					and uid not in (select entry_uid from votes where votes.user_uid=${user_uid})
					and uid not in (select entry_uid from skips where skips.user_uid=${user_uid})
					and uid not in (select entry_uid from flags where flags.user_uid=${user_uid})
					and uid not in (select entry_uid from ${userToEntry} where ${userToEntry.userUid}=${user_uid})
					and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid=${user_uid})
					and coalesce(nb_skips.count, 0) <= 12
			)

			select * from pool
			where weight > 0
			order by -ln(1 - random()) / weight
			limit 1;
		`;
}

type QueryFragment = {
	cte?: string;
	poolSelect?: string;
	poolJoin?: string;
	order: string;
};

/**
 * The relative cumulated sum of votes almost follow a square root function
 * The evolution of the percentile of the dynamic pool should match this rate
 */
const VOTE_RATE_EXPONENT = 0.55;

/**
 * The bottom percentile of the dynamic pool of entries as a function of time.
 * It follows the rate at which information flows in the system
 */
export function computeBottomPercentile() {
	return voteTimeElapsedPercent() ** VOTE_RATE_EXPONENT;
}

/**
 * We enter the end game when the votes rate drops.
 * The rate is like x ** a, so we target `a x ** (a - 1) = 1`
 * This is about 4 days
 */
const MID_GAME_THRESHOLD = VOTE_RATE_EXPONENT ** (1 / (1 - VOTE_RATE_EXPONENT));

function isEarlyGame() {
	return voteTimeElapsedPercent() < MID_GAME_THRESHOLD;
}

function isEndGame() {
	return voteTimeElapsedPercent() > 1 - MID_GAME_THRESHOLD;
}

/**
 * This value filters out 15% of entries, in the tail of the skips to votes distribution
 */
export const SKIPS_TO_VOTES_THRESHOLD = 4.1;

/**
 * Main voting phase
 *
 * 1. Define the dynamic pool of entries by:
 * - median score in the top X %
 * - skips to votes ratio less than 4
 *
 * Where X goes from 0 to 1 over the duration of the vote.
 *
 * 2. Pick an entry at random from this pool, with probability weights depending on the strategy:
 *
 * - exploration: uniform weights
 * - visibility: weight by 1 / nb votes, to priorise entries with fewer votes
 * - quality: weight by median score, to test the score robustness to higher scrutiny
 * - consensus: weight by spread / nb votes, to increase consensus
 * - ties: weight by tie-group size, to break ties
 *
 * Implementation note:
 * Weighted Random Sampling is done using A-Res with `order by -ln(1 - random()) / weight`
 * https://utopia.duth.gr/~pefraimi/research/data/2007EncOfAlg.pdf
 */
export function voteMain(user_uid: string, category: string) {
	console.log("[vote]: main phase");

	const explorationQuery: QueryFragment = {
		order: "random()",
	};
	const byMedianQuery: QueryFragment = {
		poolSelect: ", median",
		poolJoin: `
			left join medians
			on entries.uid=medians.entry_uid
		`,
		order: "-ln(1 - random()) / median",
	};
	const byNbVotesQuery: QueryFragment = {
		poolSelect: ", nb_votes.count as nb_votes_count",
		order: "-ln(1 - random()) / (1::numeric / nb_votes_count)",
	};
	const bySpreadQuery: QueryFragment = {
		poolSelect: ", (std / nb_votes.count) as spread_to_votes",
		poolJoin: `
			left join medians
			on entries.uid=medians.entry_uid
		`,
		order: "-ln(1 - random()) / (0.01 + spread_to_votes)",
	};
	const byNbTiesQuery: QueryFragment = {
		cte: `
			ties as (
				select entry_uid, count(*) over (partition by median) as tie_group_size
				from medians
			),`,
		poolSelect: ", coalesce(tie_group_size, 1) as nb_ties",
		poolJoin: `
			left join ties
			on entries.uid=ties.entry_uid
		`,
		order: "-ln(1 - random()) / nb_ties",
	};

	const earlyGameQueries = [explorationQuery, byMedianQuery];
	const middleGameQueries = [
		explorationQuery,
		byMedianQuery,
		byNbVotesQuery,
		bySpreadQuery,
		byNbTiesQuery,
	];
	const endGameQueries = [byMedianQuery, byNbVotesQuery, bySpreadQuery, byNbTiesQuery];

	const activeQueries = isEarlyGame()
		? earlyGameQueries
		: !isEndGame()
			? middleGameQueries
			: endGameQueries;

	const query: QueryFragment | undefined = randomItem(activeQueries);

	if (!query) throw new Error("[voteMain]: empty QueryFragment");

	return sql`
			with nb_votes as (
				select entry_uid, count(*)
				from votes
				where date_part('year', created_at)=${CURRENT_YEAR}
				group by entry_uid
			),

			nb_skips as (
				select entry_uid, count(*)
				from skips
				where date_part('year', created_at)=${CURRENT_YEAR}
				group by entry_uid
			),

			medians as (
				select entry_uid, percentile_disc(0.5) within group (order by score) as median, coalesce(stddev_samp(score), 0) as std
				from votes
				where date_part('year', created_at)=${CURRENT_YEAR}
				group by entry_uid
			),

			${sql.raw(query.cte ?? "")}

			ranks as (
				select entry_uid, percent_rank() over (order by median) as percent
				from medians
			),

			pool as (
				select distinct uid, ${sql.raw(entry_columns)}
				${sql.raw(query.poolSelect ?? "")}
				from entries
				left join nb_votes
				on entries.uid=nb_votes.entry_uid
				left join nb_skips
				on entries.uid=nb_skips.entry_uid
				left join ranks
				on entries.uid=ranks.entry_uid
				left join entry_to_tag
				on entries.uid=entry_to_tag.entry_uid
				${sql.raw(query.poolJoin ?? "")}

				where date_part('year', entries.created_at)=${CURRENT_YEAR}
					and entries.category=${category}
					and entries.state in ${[ENTRY_STATE.Active, ENTRY_STATE.Flagged]}
					and deleted_at is null
					and uid not in (select entry_uid from votes where votes.user_uid=${user_uid})
					and uid not in (select entry_uid from skips where skips.user_uid=${user_uid})
					and uid not in (select entry_uid from flags where flags.user_uid=${user_uid})
					and uid not in (select entry_uid from ${userToEntry} where ${userToEntry.userUid}=${user_uid})
					and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid=${user_uid})
					and ranks.percent >= ${computeBottomPercentile()}
					and (coalesce(nb_skips.count, 0)::numeric / nb_votes.count) <= ${SKIPS_TO_VOTES_THRESHOLD}
			)

			select *
			from pool
			order by ${sql.raw(query.order)}
			limit 1;
		`;
}

/**
 * Vote fallback case
 *
 * Pick an entry at random from all entries
 */
export function voteFallback(user_uid: string, category: string) {
	console.log("[vote]: fallback strategy");

	return sql`
		with pool as (
			select distinct uid, ${sql.raw(entry_columns)}
			from entries
			left join entry_to_tag
			on entries.uid=entry_to_tag.entry_uid

			where date_part('year', entries.created_at)=${CURRENT_YEAR}
			and entries.category=${category}
			and entries.state in ${[ENTRY_STATE.Active, ENTRY_STATE.Flagged]}
			and deleted_at is null
			and uid not in (select entry_uid from votes where votes.user_uid=${user_uid})
			and uid not in (select entry_uid from skips where skips.user_uid=${user_uid})
			and uid not in (select entry_uid from flags where flags.user_uid=${user_uid})
			and uid not in (select entry_uid from ${userToEntry} where ${userToEntry.userUid}=${user_uid})
			and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid=${user_uid})
		)

		select * from pool
		order by random()
		limit 1;
		`;
}

export function rank(category: string) {
	/**
	 * Approximate the canonical majority judgment tie-breaking rule by sorting lexicographically according to:
	 * (percentile_disc(0.5), percentile_disc(0.5 - δ), percentile_disc(0.5 + δ), percentile_disc(0.5 - 2δ), percentile_disc(0.5 + 2δ), ...)
	 */

	/**
	 * This corresponds to the smallest step between two entry scores over all entries, which is also the slider resolution and storage resolution
	 */
	const delta = 0.01;
	const depth = 10;
	const percentiles = ["percentile_disc(0.5) within group (order by score) as m0"];

	for (let i = 1; i <= depth; i++) {
		percentiles.push(
			`percentile_disc(${round(
				0.5 - i * delta,
				3,
			)}) within group (order by score) as m${2 * i - 1}`,
		);
		percentiles.push(
			`percentile_disc(${round(0.5 + i * delta, 3)}) within group (order by score) as m${2 * i}`,
		);
	}

	const tieBreaker = `(${Array.from({ length: depth * 2 + 1 })
		.map((_, i) => "m" + i)
		.join(",")})`;

	return sql`
		with scores as (
			select entry_uid, ${sql.raw(percentiles.join(","))}
			from votes
			where date_part('year', created_at)=${CURRENT_YEAR}
			group by entry_uid
		),

		sort as (
			select entry_uid, m0, dense_rank() over (order by ${sql.raw(tieBreaker)} desc) as ranking
			from (scores join entries on scores.entry_uid=entries.uid)
			where category=${category}
			and entries.state=${ENTRY_STATE.Active}
			and deleted_at is null
			order by ${sql.raw(tieBreaker)} desc
		)

		update entries set rank=ranking, final_score=m0
		from sort
		where sort.entry_uid=entries.uid;
	`;
}
