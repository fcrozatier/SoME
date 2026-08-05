with nb_votes as (
  select entry_uid, count(*)
  from votes
  where date_part('year', created_at)='2026'
  group by entry_uid
),

nb_skips as (
  select entry_uid, count(*)
  from skips
  where date_part('year', created_at)='2026'
  group by entry_uid
),

medians as (
  select entry_uid, percentile_disc(0.5) within group (order by score) as median, coalesce(stddev_samp(score), 0) as std
  from votes
  where date_part('year', created_at)='2026'
  group by entry_uid
),

ties as (
  select entry_uid, count(*) over (partition by median) as tie_group_size
  from medians
),

ranks as (
  select entry_uid, percent_rank() over (order by median) as percent
  from medians
),

pool as (
  select distinct uid, title, ranks.percent, median, coalesce(tie_group_size, 1) as nb_ties
  from entries
  left join nb_votes
  on entries.uid=nb_votes.entry_uid
  left join nb_skips
  on entries.uid=nb_skips.entry_uid
  left join medians
  on entries.uid=medians.entry_uid
  left join ties
  on entries.uid=ties.entry_uid
  left join ranks
  on entries.uid=ranks.entry_uid
  left join entry_to_tag
  on entries.uid=entry_to_tag.entry_uid

  where date_part('year', entries.created_at)='2026'
    and entries.category='video'
    and entries.state='active'
    and deleted_at is null
    and uid not in (select entry_uid from votes where votes.user_uid='fe68e7d1-a78a-4ae1-b98f-7c5a2867aa58')
    and uid not in (select entry_uid from skips where skips.user_uid='fe68e7d1-a78a-4ae1-b98f-7c5a2867aa58')
    and uid not in (select entry_uid from flags where flags.user_uid='fe68e7d1-a78a-4ae1-b98f-7c5a2867aa58')
    and uid not in (select entry_uid from user_to_entry where user_to_entry.user_uid='fe68e7d1-a78a-4ae1-b98f-7c5a2867aa58')

    and ranks.percent >= 0
    and (coalesce(nb_skips.count, 0)::numeric / nb_votes.count) <= 4
)

select *
from pool
order by -ln(1 - random()) / nb_ties
limit 10
;