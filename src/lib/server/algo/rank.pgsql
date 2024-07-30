with scores as (
  select entry_uid, percentile_cont(0.5) within group (order by score) as median
  from votes
  group by entry_uid
),

sort as (
  select entry_uid, median, dense_rank() over (order by median desc) as ranking
  from (scores join entries on scores.entry_uid=entries.uid)
  where category='video'
  and active='t'
  order by median desc
)

update entries set rank=ranking, final_score=median
from sort
where sort.entry_uid=entries.uid;