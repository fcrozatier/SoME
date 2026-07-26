with pool as (
  select distinct uid, title, description, entries.category, url, thumbnail
  from entries
  left join entry_to_tag
  on entries.uid=entry_to_tag.entry_uid

  where date_part('year', entries.created_at)='2026'
  and entries.category='video'
  and active='true'
  and deleted_at is null
  and uid not in (select entry_uid from votes where votes.user_uid='fe68e7d1-a78a-4ae1-b98f-7c5a2867aa58')
  and uid not in (select entry_uid from skips where skips.user_uid='fe68e7d1-a78a-4ae1-b98f-7c5a2867aa58')
  and uid not in (select entry_uid from flags where flags.user_uid='fe68e7d1-a78a-4ae1-b98f-7c5a2867aa58')
  and uid not in (select entry_uid from user_to_entry where user_to_entry.user_uid='fe68e7d1-a78a-4ae1-b98f-7c5a2867aa58')
  and entry_to_tag.tag_id in (select tag_id from user_to_tag where user_uid='fe68e7d1-a78a-4ae1-b98f-7c5a2867aa58')
)

select * from pool
order by random()
limit 1;