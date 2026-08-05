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
  select entry_uid, percentile_disc(0.5) within group (order by score) as median, stddev_samp(score) as std
  from votes
  where date_part('year', created_at)='2026'
  group by entry_uid
),

ranks as (
  select entry_uid, percent_rank() over (order by median) as percent
  from medians
),

pool as (
  select distinct uid, title, ranks.percent, median
  from entries
  left join nb_votes
  on entries.uid=nb_votes.entry_uid
  left join nb_skips
  on entries.uid=nb_skips.entry_uid
  left join medians
  on entries.uid=medians.entry_uid
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
    and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid='fe68e7d1-a78a-4ae1-b98f-7c5a2867aa58')
    and ranks.percent >= 0
    and (coalesce(nb_skips.count, 0)::numeric / nb_votes.count) <= 4
)

select *
from pool
order by -ln(1 - random()) / median
limit 10
;