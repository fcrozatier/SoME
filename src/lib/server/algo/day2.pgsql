-- Choose an entry at random with probability weighted by its median score

with cached as (
  select entry_uid
  from cache join entries on cache.entry_uid=entries.uid
  where cache.user_uid='70601724-87ef-4b68-87dc-c9cbb06159fc'
  and cache.category='video'
),

median as (
  select entry_uid, percentile_cont(0.5) within group (order by score) as score
  from (select entry_uid, score from votes) as Q
  group by entry_uid
),

selection as (
  select uid, title, entries.category, COALESCE(median.score, 9) as score
  from entries
  left join median
  on entries.uid=median.entry_uid

  where
    case when (select count(*) > 0 from cached)
    then
      uid in (select entry_uid from cached)
    else
      entries.category='video'
      and active='true'
      and uid not in (select entry_uid from votes where votes.user_uid='70601724-87ef-4b68-87dc-c9cbb06159fc')
      and uid not in (select entry_uid from skips where skips.user_uid='70601724-87ef-4b68-87dc-c9cbb06159fc')
      and uid not in (select entry_uid from flags where flags.user_uid='70601724-87ef-4b68-87dc-c9cbb06159fc')
      and uid not in (select entry_uid from user_to_entry where user_to_entry.user_uid='70601724-87ef-4b68-87dc-c9cbb06159fc')
    end

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
