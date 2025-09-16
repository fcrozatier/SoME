import { sql } from "drizzle-orm";
import { userToEntry } from "../db/schema";
import { currentYear } from "$lib/config";

/**
 * Select entry at random and prioritize entries with less votes (or incoming votes)
 */
export function query1(token: string, category: string) {
	return sql`
			with total as (
				select entry_uid, count(*) as count
				from (
					select entry_uid, created_at from votes
					union all
					select entry_uid, created_at from cache
					where date_part('year', created_at)=${currentYear}
					) as summation
				group by entry_uid
			),

			selection as (
				select uid, title, description, entries.category, url, thumbnail, coalesce(total.count, 0) as score
				from entries
				left join total
				on entries.uid=total.entry_uid
				left join entry_to_tag
				on entries.uid=entry_to_tag.entry_uid

				where entries.category=${category}
					and active='true'
					and date_part('year', entries.created_at)=${currentYear}
					and uid not in (select entry_uid from votes where votes.user_uid=${token})
					and uid not in (select entry_uid from skips where skips.user_uid=${token})
					and uid not in (select entry_uid from flags where flags.user_uid=${token})
					and uid not in (select entry_uid from ${userToEntry} where ${userToEntry.userUid}=${token})
					and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid=${token})

				order by total.count nulls first
			),

			maximum as (
				select max(score) as max from selection
			),

			cutoff as (
				select floor(random() * (select sum(max-score) from selection, maximum)) as value
			),

			partial as (
				select uid, sum(max-score) over (
					order by score rows between unbounded preceding and current row) sum from selection, maximum
			)

			select * from (selection join partial on selection.uid=partial.uid), cutoff
			where partial.sum >= cutoff.value
			limit 1;
		`;
}

/**
 * Select entries at random with probability weighted by median scores
 * We can still accept late entries at this stage, they will be prioritized
 */
export function query2(token: string, category: string) {
	return sql`
			with median as (
				select entry_uid, percentile_cont(0.5) within group (order by score) as score
				from (select entry_uid, score from votes where date_part('year', created_at)=${currentYear}) as Q
				group by entry_uid
			),

			selection as (
				select uid, title, description, entries.category, url, thumbnail, coalesce(median.score, 9) as score
				from entries
				left join median
				on entries.uid=median.entry_uid
				left join entry_to_tag
				on entries.uid=entry_to_tag.entry_uid

				where entries.category=${category}
					and active='true'
					and date_part('year', created_at)=${currentYear}
					and uid not in (select entry_uid from votes where votes.user_uid=${token})
					and uid not in (select entry_uid from skips where skips.user_uid=${token})
					and uid not in (select entry_uid from flags where flags.user_uid=${token})
					and uid not in (select entry_uid from ${userToEntry} where ${userToEntry.userUid}=${token})
					and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid=${token})

				order by score nulls last
			),

			cutoff as (
			  select random() * (select sum(score) from selection) as value
			),

			partial as (
				select uid, sum(score) over (
					order by score rows between unbounded preceding and current row) sum from selection
			)

			select * from (selection join partial on selection.uid=partial.uid), cutoff
			where partial.sum >= cutoff.value
			limit 1;
		`;
}

const multiplier_start_date = "2025-09-12";

/**
 * Select entries at random with probability weighted by median score with a (utility) boost based on the std
 * We can still accept late entries at this stage (but shouldn't), they will be prioritized
 */
export function query3(token: string, category: string) {
	return sql`
			with scores as (
				select entry_uid, count(*), percentile_cont(0.5) within group (order by score) as median,
				stddev_samp(score) as std
				from (select entry_uid, score from votes where date_part('year', created_at)=${currentYear}) as Q
				group by entry_uid
			),

			multiplier as (
				select entry_uid, count(*) as value
				from votes
				where created_at <= ${multiplier_start_date}
				group by entry_uid
			),

			selection as (
				select uid, title, description, entries.category, url, thumbnail, coalesce(scores.median, 9) + coalesce(multiplier.value, 0) * coalesce(scores.std, 0) / coalesce(scores.count, 1) as score
				from entries
				left join multiplier
				on entries.uid=multiplier.entry_uid
				left join scores
				on entries.uid=scores.entry_uid
				left join entry_to_tag
				on entries.uid=entry_to_tag.entry_uid

				where entries.category=${category}
					and active='true'
					and date_part('year', created_at)=${currentYear}
					and uid not in (select entry_uid from votes where votes.user_uid=${token})
					and uid not in (select entry_uid from skips where skips.user_uid=${token})
					and uid not in (select entry_uid from flags where flags.user_uid=${token})
					and uid not in (select entry_uid from ${userToEntry} where ${userToEntry.userUid}=${token})
					and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid=${token})

				order by score nulls last
			),

			cutoff as (
				select (random() * (select sum(score) from selection)) as value
			),

			partial as (
				select uid, sum(score) over (
					order by score rows between unbounded preceding and current row) sum from selection
			)

			select * from (selection join partial on selection.uid=partial.uid), cutoff
			where partial.sum >= cutoff.value
			limit 1;
		`;
}

/**
 * Select top entries with few votes
 */
export function query4(token: string, category: string) {
	return sql`
			with median as (
				select entry_uid,
					percentile_cont(0.5) within group (order by score) as score
				from votes
				where date_part('year', created_at)=${currentYear}
				group by entry_uid
				having percentile_cont(0.5) within group (order by score) >= 6
					and count(*) < 10
			),

			selection as (
				select uid, title, description, entries.category, url, thumbnail, coalesce(median.score, 9) as score
				from entries
				join median on entries.uid=median.entry_uid
				left join entry_to_tag
				on entries.uid=entry_to_tag.entry_uid

				where entries.category=${category}
					and active='true'
					and date_part('year', created_at)=${currentYear}
					and uid not in (select entry_uid from votes where votes.user_uid=${token})
					and uid not in (select entry_uid from skips where skips.user_uid=${token})
					and uid not in (select entry_uid from flags where flags.user_uid=${token})
					and uid not in (select entry_uid from ${userToEntry} where ${userToEntry.userUid}=${token})
					and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid=${token})

				order by score nulls last
			)

			select *
			from selection
			order by random()
			limit 1;
		`;
}

export function rank(category: string) {
	return sql`
		with scores as (
			select entry_uid, percentile_cont(0.5) within group (order by score) as median
			from votes
			where date_part('year', created_at)=${currentYear}
			group by entry_uid
		),

		sort as (
			select entry_uid, median, dense_rank() over (order by median desc) as ranking
			from (scores join entries on scores.entry_uid=entries.uid)
			where category=${category}
			and active='t'
			order by median desc
		)

		update entries set rank=ranking, final_score=median
		from sort
		where sort.entry_uid=entries.uid;
	`;
}
