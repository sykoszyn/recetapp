-- RecetApp — 0006: funciones RPC de consulta (búsqueda por ingredientes).

-- Dado un listado de ingredientes que el usuario tiene en casa, devuelve
-- recetas publicadas ordenadas por cuántos ingredientes le faltan (0, 1, 2...).
-- Se resuelve en una sola consulta en el servidor por eficiencia (evita
-- N+1 desde el cliente).
create or replace function recipes_matching_ingredients(p_ingredient_names text[], p_max_missing int default 2, p_limit int default 30)
returns table (
  recipe_id uuid,
  total_ingredients bigint,
  matched_ingredients bigint,
  missing_ingredients bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with normalized(term) as (
    select lower(unnest(p_ingredient_names))
  ),
  recipe_totals as (
    select ri.recipe_id, count(*) as total_ingredients
    from recipe_ingredients ri
    join recipes r on r.id = ri.recipe_id and r.status = 'published'
    group by ri.recipe_id
  ),
  recipe_matches as (
    select ri.recipe_id, count(distinct ri.id) as matched_ingredients
    from recipe_ingredients ri
    join recipe_totals rt on rt.recipe_id = ri.recipe_id
    where exists (
      select 1 from normalized n where lower(ri.name_snapshot) like '%' || n.term || '%'
    )
    group by ri.recipe_id
  )
  select
    rt.recipe_id,
    rt.total_ingredients,
    coalesce(rm.matched_ingredients, 0) as matched_ingredients,
    rt.total_ingredients - coalesce(rm.matched_ingredients, 0) as missing_ingredients
  from recipe_totals rt
  left join recipe_matches rm on rm.recipe_id = rt.recipe_id
  where coalesce(rm.matched_ingredients, 0) > 0
    and (rt.total_ingredients - coalesce(rm.matched_ingredients, 0)) <= p_max_missing
  order by missing_ingredients asc, matched_ingredients desc
  limit p_limit;
$$;
