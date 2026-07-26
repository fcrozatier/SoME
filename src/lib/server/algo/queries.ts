import { sql } from "drizzle-orm";
import { userToEntry } from "../db/schema";
import { currentYear } from "$lib/config";
import { randomItem, round } from "@fcrozatier/ts-helpers";

const entry_columns = "title, description, entries.category, url, thumbnail";

/**
 * Vote warmup phase
 *
 * Pick an entry at random from all entries with less than 4 votes and 12 skips
 *
 * Entries must all have at least one vote before the main phase
 */
export function voteWarmup(
	user_uid: string,
	category: string,
	options = { nb_votes_max: "4", nb_skips_max: "12" },
) {
	return sql`
			with nb_votes as (
				select entry_uid, count(*) as count
				from votes
				where date_part('year', created_at)=${currentYear}
				group by entry_uid
			),

			nb_skips as (
				select entry_uid, count(*) as count
				from skips
				where date_part('year', created_at)=${currentYear}
				group by entry_uid
			),

			pool as (
				select distinct uid, ${
		sql.raw(entry_columns)
	}, coalesce(nb_skips.count, 0) as nb_skips_count,
					(${
		sql.raw(options.nb_votes_max)
	} - coalesce(nb_votes.count, 0)) as weight
				from entries
				left join nb_votes
				on entries.uid=nb_votes.entry_uid
				left join nb_skips
				on entries.uid=nb_skips.entry_uid
				left join entry_to_tag
				on entries.uid=entry_to_tag.entry_uid

				where date_part('year', entries.created_at)=${currentYear}
					and entries.category=${category}
					and active='true'
					and deleted_at is null
					and uid not in (select entry_uid from votes where votes.user_uid=${user_uid})
					and uid not in (select entry_uid from skips where skips.user_uid=${user_uid})
					and uid not in (select entry_uid from flags where flags.user_uid=${user_uid})
					and uid not in (select entry_uid from ${userToEntry} where ${userToEntry.userUid}=${user_uid})
					and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid=${user_uid})
					and coalesce(nb_skips.count, 0) <= ${options.nb_skips_max}
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
 * Main voting phase
 *
 * Pick a random entry, weighted by nb votes (priorises fewer votes)
 *
 * 2. Focus votes on entries with scores in the top X % with skips to votes ratio less than 4 and choose at random from
 * [
 * 	entries in the top X % with no additional constraint (explore)
 * 	entries weighted by score (double check top entries)
 * 	entries weighted by spread to votes ratio (increase consensus)
 * 	entries weighted by tie-group size (break ties)
 * 	entries weighted by 1 / nb votes (priorises entries with few votes)
 * ]
 *
 * Where X goes from 0 to 99 over the duration of the vote
 *
 * Weighted Random Sampling is done with A-Res with `order by -ln(1 - random()) / weight`
 * https://utopia.duth.gr/~pefraimi/research/data/2007EncOfAlg.pdf
 */
export function voteMain(
	user_uid: string,
	category: string,
	options = { skips_to_votes_ratio: "4", percentile: "0.0" },
) {
	const explorationQuery: QueryFragment = {
		order: "random()",
	};
	const byNbVotesQuery: QueryFragment = {
		poolSelect: ", nb_votes.count as nb_votes_count",
		order: "-ln(1 - random()) / (1::numeric / nb_votes_count)",
	};
	const byMedianQuery: QueryFragment = {
		poolSelect: ", median",
		poolJoin: `
			left join medians
			on entries.uid=medians.entry_uid
		`,
		order: "-ln(1 - random()) / median",
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

	const query: QueryFragment | undefined = randomItem([
		explorationQuery,
		byNbVotesQuery,
		byMedianQuery,
		bySpreadQuery,
		byNbTiesQuery,
	]);

	if (!query) {
		throw new Error("Can't make vote sql query with an empty query fragment");
	}

	return sql`
			with nb_votes as (
				select entry_uid, count(*)
				from votes
				where date_part('year', created_at)=${currentYear}
				group by entry_uid
			),

			nb_skips as (
				select entry_uid, count(*)
				from skips
				where date_part('year', created_at)=${currentYear}
				group by entry_uid
			),

			medians as (
				select entry_uid, percentile_disc(0.5) within group (order by score) as median, coalesce(stddev_samp(score), 0) as std
				from votes
				where date_part('year', created_at)=${currentYear}
				group by entry_uid
			),

			${sql.raw(query.cte ?? "")}

			ranks as (
				select entry_uid, percent_rank() over (order by median) as percent
				from medians
			),

			pool as (
				select distinct uid, ${sql.raw(entry_columns)} ${sql.raw(query.poolSelect ?? "")}
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

				where date_part('year', entries.created_at)=${currentYear}
					and entries.category=${category}
					and active='true'
					and deleted_at is null
					and uid not in (select entry_uid from votes where votes.user_uid=${user_uid})
					and uid not in (select entry_uid from skips where skips.user_uid=${user_uid})
					and uid not in (select entry_uid from flags where flags.user_uid=${user_uid})
					and uid not in (select entry_uid from ${userToEntry} where ${userToEntry.userUid}=${user_uid})
					and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid=${user_uid})
					and ranks.percent >= ${options.percentile}
					and (coalesce(nb_skips.count, 0)::numeric / nb_votes.count) <= ${options.skips_to_votes_ratio}
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
	return sql`
		with pool as (
			select distinct uid, ${sql.raw(entry_columns)}
			from entries
			left join entry_to_tag
			on entries.uid=entry_to_tag.entry_uid

			where date_part('year', entries.created_at)=${currentYear}
			and entries.category=${category}
			and active='true'
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

	const delta = 0.01;
	const depth = 10;
	const percentiles = [
		"percentile_disc(0.5) within group (order by score) as m0",
	];

	for (let i = 1; i <= depth; i++) {
		percentiles.push(
			`percentile_disc(${
				round(0.5 - i * delta, 3)
			}) within group (order by score) as m${2 * i - 1}`,
		);
		percentiles.push(
			`percentile_disc(${
				round(0.5 + i * delta, 3)
			}) within group (order by score) as m${2 * i}`,
		);
	}

	const tieBreaker = `(${
		Array.from({ length: depth * 2 + 1 }).map((_, i) => "m" + i).join(",")
	})`;

	return sql`
		with scores as (
			select entry_uid, ${sql.raw(percentiles.join(","))}
			from votes
			where date_part('year', created_at)=${currentYear}
			group by entry_uid
		),

		sort as (
			select entry_uid, m0, dense_rank() over (order by ${
		sql.raw(tieBreaker)
	} desc) as ranking
			from (scores join entries on scores.entry_uid=entries.uid)
			where category=${category}
			and active='t'
			and deleted_at is null
			order by ${sql.raw(tieBreaker)} desc
		)

		update entries set rank=ranking, final_score=m0
		from sort
		where sort.entry_uid=entries.uid;
	`;
}
