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

pool as (
  select distinct uid, title, description, entries.category, url, thumbnail, coalesce(nb_skips.count, 0) as nb_skips_count, (4 - coalesce(nb_votes.count, 0)) as weight
  from entries
  left join nb_votes
  on entries.uid=nb_votes.entry_uid
  left join nb_skips
  on entries.uid=nb_skips.entry_uid
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
    and coalesce(nb_skips.count, 0) <= 12
)

select * from pool
where weight > 0
order by -ln(1 - random()) / weight
limit 1;