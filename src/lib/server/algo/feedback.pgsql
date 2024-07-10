
with created as (
  select entry_uid, title
  from entries join user_to_entry
  on entries.uid=user_to_entry.entry_uid
  where user_uid='021b26a1-acab-4eb7-ab99-fe563f79a267'
),

scores as (
  select entry_uid, percentile_cont(0.5) within group (order by score) as median
  from votes
  where entry_uid in (select entry_uid from created)
  group by entry_uid
),

feedbacks as (
  select votes.entry_uid, feedback, score
  from votes
  where entry_uid in (select entry_uid from created)
)

select created.entry_uid, title, score, median, feedback from (scores join feedbacks on scores.entry_uid=feedbacks.entry_uid)
join created on scores.entry_uid=created.entry_uid;
