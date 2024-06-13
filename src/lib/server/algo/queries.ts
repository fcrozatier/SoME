import { sql } from 'drizzle-orm';
import { usersToEntries } from '../db/schema';

export function query1(token: string, category: string) {
	return sql`
			with cached as (
				select entry_uid
				from cache join entries on cache.entry_uid=entries.uid
				where cache.user_uid=${token}
				and cache.category=${category}
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
			),

			selection as (
				select uid, title, description, entries.category, url, thumbnail, coalesce(total.count, 0) as score
				from entries
				left join total
				on entries.uid=total.entry_uid

				where
					case when (select count(*) > 0 from cached)
				then
					uid in (select entry_uid from cached)
				else
					entries.category=${category}
					and active='true'
					and uid not in (select entry_uid from votes where votes.user_uid=${token})
					and uid not in (select entry_uid from skips where skips.user_uid=${token})
					and uid not in (select entry_uid from flags where flags.user_uid=${token})
					and uid not in (select entry_uid from ${usersToEntries} where ${usersToEntries.userUid}=${token})
				end

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
					order by score rows between unbounded preceding and current row) sum from selection, maximum, cutoff
			)

			select * from (selection join partial on selection.uid=partial.uid), cutoff
			where partial.sum >= cutoff.value
			limit 1;
		`;
}
