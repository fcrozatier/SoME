-- Choose an entry at random with probability weighted by the inverse number of maybe-votes

with cached as (
  select entry_uid
  from cache join entries on cache.entry_uid=entries.uid
  where cache.user_uid='021b26a1-acab-4eb7-ab99-fe563f79a267'
  and cache.category='video'
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
  select uid, title, entries.category, coalesce(total.count, 0) as score
  from entries
  left join total
  on entries.uid=total.entry_uid

  where
    case when (select count(*) > 0 from cached)
    then
      uid in (select entry_uid from cached)
    else
      entries.category='video'
      and active='true'
      and uid not in (select entry_uid from votes where votes.user_uid='021b26a1-acab-4eb7-ab99-fe563f79a267')
      and uid not in (select entry_uid from skips where skips.user_uid='021b26a1-acab-4eb7-ab99-fe563f79a267')
      and uid not in (select entry_uid from flags where flags.user_uid='021b26a1-acab-4eb7-ab99-fe563f79a267')
      and uid not in (select entry_uid from user_to_entry where user_to_entry.user_uid='021b26a1-acab-4eb7-ab99-fe563f79a267')
    end

order by score nulls first
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
