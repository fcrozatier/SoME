with
  overall_score as (
    select entry_uid, percentile_cont(0.5) within group (order by score) as median
    from votes
    where date_part('year', created_at)='2025'
    group by entry_uid
  ),

  teacher_score as (
    select entry_uid, percentile_cont(0.5) within group (order by score) as median
    from votes join users on votes.user_uid=users.uid
    where date_part('year', votes.created_at)='2025'
    and is_teacher='t'
    group by entry_uid
  ),

  rank as (
    select uid, overall_score.median as overall_median, dense_rank() over (order by overall_score.median desc) as ranking
    from entries
    right join overall_score on overall_score.entry_uid=entries.uid
    where category='video'
    and active='t'
    order by overall_median desc
  ),

  paginated as (
    select entries.uid, title, description, category, url, thumbnail, ranking, overall_median, teacher_score.median as teacher_median, count(*) over () as total_items
    from entries
    right join rank on entries.uid=rank.uid
    left join teacher_score on entries.uid=teacher_score.entry_uid
    order by rank asc
    limit 50
    offset 0
  )

  select *, ceil(total_items / 50) as pages from paginated;