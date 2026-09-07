-- RecetApp — 0003: Row Level Security. Nunca confiar solo en el frontend:
-- todo lo que la API de Supabase expone pasa primero por estas policies.

alter table profiles enable row level security;
alter table categories enable row level security;
alter table user_preferences enable row level security;
alter table ingredients enable row level security;
alter table ingredient_conversions enable row level security;
alter table recipes enable row level security;
alter table recipe_categories enable row level security;
alter table recipe_ingredients enable row level security;
alter table recipe_steps enable row level security;
alter table recipe_media enable row level security;
alter table recipe_tags enable row level security;
alter table recipe_views enable row level security;
alter table posts enable row level security;
alter table post_media enable row level security;
alter table post_recipe_links enable row level security;
alter table likes enable row level security;
alter table recipe_likes enable row level security;
alter table comments enable row level security;
alter table comment_likes enable row level security;
alter table followers enable row level security;
alter table saved_recipes enable row level security;
alter table collections enable row level security;
alter table collection_recipes enable row level security;
alter table recipe_reviews enable row level security;
alter table notifications enable row level security;

-- ── PROFILES ────────────────────────────────────────────────────────────
drop policy if exists "profiles_select_public" on profiles;
create policy "profiles_select_public" on profiles for select using (true);

drop policy if exists "profiles_update_own" on profiles;
create policy "profiles_update_own" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- (insert lo hace el trigger handle_new_user como owner de la función; no hay policy de insert para clientes)

-- ── CATEGORIES ──────────────────────────────────────────────────────────
drop policy if exists "categories_select_public" on categories;
create policy "categories_select_public" on categories for select using (true);

-- ── USER_PREFERENCES ────────────────────────────────────────────────────
drop policy if exists "user_preferences_select_own" on user_preferences;
create policy "user_preferences_select_own" on user_preferences for select using (auth.uid() = user_id);

drop policy if exists "user_preferences_insert_own" on user_preferences;
create policy "user_preferences_insert_own" on user_preferences for insert with check (auth.uid() = user_id);

drop policy if exists "user_preferences_delete_own" on user_preferences;
create policy "user_preferences_delete_own" on user_preferences for delete using (auth.uid() = user_id);

-- ── INGREDIENTS / CONVERSIONS ───────────────────────────────────────────
drop policy if exists "ingredients_select_public" on ingredients;
create policy "ingredients_select_public" on ingredients for select using (true);

drop policy if exists "ingredients_insert_authenticated" on ingredients;
create policy "ingredients_insert_authenticated" on ingredients for insert
  to authenticated with check (true);

drop policy if exists "ingredient_conversions_select_public" on ingredient_conversions;
create policy "ingredient_conversions_select_public" on ingredient_conversions for select using (true);
-- las conversiones se curan manualmente (service role) para evitar datos erróneos.

-- ── RECIPES ─────────────────────────────────────────────────────────────
drop policy if exists "recipes_select_published_or_own" on recipes;
create policy "recipes_select_published_or_own" on recipes for select
  using (status = 'published' or auth.uid() = user_id);

drop policy if exists "recipes_insert_own" on recipes;
create policy "recipes_insert_own" on recipes for insert with check (auth.uid() = user_id);

drop policy if exists "recipes_update_own" on recipes;
create policy "recipes_update_own" on recipes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "recipes_delete_own" on recipes;
create policy "recipes_delete_own" on recipes for delete using (auth.uid() = user_id);

-- helper: ¿la receta es visible (publicada o propia)?
create or replace function recipe_is_visible(target_recipe_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from recipes r
    where r.id = target_recipe_id and (r.status = 'published' or r.user_id = auth.uid())
  );
$$;

-- helper: ¿el usuario actual es dueño de la receta?
create or replace function recipe_is_own(target_recipe_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from recipes r where r.id = target_recipe_id and r.user_id = auth.uid());
$$;

-- ── DETALLE DE RECETA (categorías, ingredientes, pasos, media, tags) ────
drop policy if exists "recipe_categories_select" on recipe_categories;
create policy "recipe_categories_select" on recipe_categories for select using (recipe_is_visible(recipe_id));
drop policy if exists "recipe_categories_write" on recipe_categories;
create policy "recipe_categories_write" on recipe_categories for all
  using (recipe_is_own(recipe_id)) with check (recipe_is_own(recipe_id));

drop policy if exists "recipe_ingredients_select" on recipe_ingredients;
create policy "recipe_ingredients_select" on recipe_ingredients for select using (recipe_is_visible(recipe_id));
drop policy if exists "recipe_ingredients_write" on recipe_ingredients;
create policy "recipe_ingredients_write" on recipe_ingredients for all
  using (recipe_is_own(recipe_id)) with check (recipe_is_own(recipe_id));

drop policy if exists "recipe_steps_select" on recipe_steps;
create policy "recipe_steps_select" on recipe_steps for select using (recipe_is_visible(recipe_id));
drop policy if exists "recipe_steps_write" on recipe_steps;
create policy "recipe_steps_write" on recipe_steps for all
  using (recipe_is_own(recipe_id)) with check (recipe_is_own(recipe_id));

drop policy if exists "recipe_media_select" on recipe_media;
create policy "recipe_media_select" on recipe_media for select using (recipe_is_visible(recipe_id));
drop policy if exists "recipe_media_write" on recipe_media;
create policy "recipe_media_write" on recipe_media for all
  using (recipe_is_own(recipe_id)) with check (recipe_is_own(recipe_id));

drop policy if exists "recipe_tags_select" on recipe_tags;
create policy "recipe_tags_select" on recipe_tags for select using (recipe_is_visible(recipe_id));
drop policy if exists "recipe_tags_write" on recipe_tags;
create policy "recipe_tags_write" on recipe_tags for all
  using (recipe_is_own(recipe_id)) with check (recipe_is_own(recipe_id));

-- ── RECIPE_VIEWS ────────────────────────────────────────────────────────
drop policy if exists "recipe_views_insert_anyone" on recipe_views;
create policy "recipe_views_insert_anyone" on recipe_views for insert
  with check (user_id is null or user_id = auth.uid());
drop policy if exists "recipe_views_select_own_recipe" on recipe_views;
create policy "recipe_views_select_own_recipe" on recipe_views for select using (recipe_is_own(recipe_id));

-- ── POSTS ───────────────────────────────────────────────────────────────
drop policy if exists "posts_select_public" on posts;
create policy "posts_select_public" on posts for select using (true);

drop policy if exists "posts_insert_own" on posts;
create policy "posts_insert_own" on posts for insert with check (auth.uid() = user_id);

drop policy if exists "posts_update_own" on posts;
create policy "posts_update_own" on posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "posts_delete_own" on posts;
create policy "posts_delete_own" on posts for delete using (auth.uid() = user_id);

create or replace function post_is_own(target_post_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from posts p where p.id = target_post_id and p.user_id = auth.uid());
$$;

drop policy if exists "post_media_select_public" on post_media;
create policy "post_media_select_public" on post_media for select using (true);
drop policy if exists "post_media_write_own" on post_media;
create policy "post_media_write_own" on post_media for all
  using (post_is_own(post_id)) with check (post_is_own(post_id));

drop policy if exists "post_recipe_links_select_public" on post_recipe_links;
create policy "post_recipe_links_select_public" on post_recipe_links for select using (true);
drop policy if exists "post_recipe_links_write_own_post" on post_recipe_links;
create policy "post_recipe_links_write_own_post" on post_recipe_links for all
  using (post_is_own(post_id)) with check (post_is_own(post_id));

-- ── LIKES ───────────────────────────────────────────────────────────────
drop policy if exists "likes_select_public" on likes;
create policy "likes_select_public" on likes for select using (true);
drop policy if exists "likes_insert_own" on likes;
create policy "likes_insert_own" on likes for insert with check (auth.uid() = user_id);
drop policy if exists "likes_delete_own" on likes;
create policy "likes_delete_own" on likes for delete using (auth.uid() = user_id);

drop policy if exists "recipe_likes_select_public" on recipe_likes;
create policy "recipe_likes_select_public" on recipe_likes for select using (true);
drop policy if exists "recipe_likes_insert_own" on recipe_likes;
create policy "recipe_likes_insert_own" on recipe_likes for insert with check (auth.uid() = user_id);
drop policy if exists "recipe_likes_delete_own" on recipe_likes;
create policy "recipe_likes_delete_own" on recipe_likes for delete using (auth.uid() = user_id);

drop policy if exists "comment_likes_select_public" on comment_likes;
create policy "comment_likes_select_public" on comment_likes for select using (true);
drop policy if exists "comment_likes_insert_own" on comment_likes;
create policy "comment_likes_insert_own" on comment_likes for insert with check (auth.uid() = user_id);
drop policy if exists "comment_likes_delete_own" on comment_likes;
create policy "comment_likes_delete_own" on comment_likes for delete using (auth.uid() = user_id);

-- ── COMMENTS ────────────────────────────────────────────────────────────
drop policy if exists "comments_select_public" on comments;
create policy "comments_select_public" on comments for select using (true);

drop policy if exists "comments_insert_own" on comments;
create policy "comments_insert_own" on comments for insert with check (auth.uid() = user_id);

drop policy if exists "comments_delete_own" on comments;
create policy "comments_delete_own" on comments for delete using (auth.uid() = user_id);

-- ── FOLLOWERS ───────────────────────────────────────────────────────────
drop policy if exists "followers_select_public" on followers;
create policy "followers_select_public" on followers for select using (true);

drop policy if exists "followers_insert_own" on followers;
create policy "followers_insert_own" on followers for insert with check (auth.uid() = follower_id);

drop policy if exists "followers_delete_own" on followers;
create policy "followers_delete_own" on followers for delete using (auth.uid() = follower_id);

-- ── GUARDADOS Y COLECCIONES (privado del dueño) ─────────────────────────
drop policy if exists "saved_recipes_all_own" on saved_recipes;
create policy "saved_recipes_all_own" on saved_recipes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "collections_all_own" on collections;
create policy "collections_all_own" on collections for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function collection_is_own(target_collection_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from collections c where c.id = target_collection_id and c.user_id = auth.uid());
$$;

drop policy if exists "collection_recipes_all_own" on collection_recipes;
create policy "collection_recipes_all_own" on collection_recipes for all
  using (collection_is_own(collection_id)) with check (collection_is_own(collection_id));

-- ── VALORACIONES ────────────────────────────────────────────────────────
drop policy if exists "recipe_reviews_select_public" on recipe_reviews;
create policy "recipe_reviews_select_public" on recipe_reviews for select using (true);

drop policy if exists "recipe_reviews_insert_own_cooked" on recipe_reviews;
create policy "recipe_reviews_insert_own_cooked" on recipe_reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from post_recipe_links pl
      join posts p on p.id = pl.post_id
      where pl.recipe_id = recipe_reviews.recipe_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "recipe_reviews_update_own" on recipe_reviews;
create policy "recipe_reviews_update_own" on recipe_reviews for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "recipe_reviews_delete_own" on recipe_reviews;
create policy "recipe_reviews_delete_own" on recipe_reviews for delete using (auth.uid() = user_id);

-- ── NOTIFICACIONES (privadas, solo lectura/actualización propia) ───────
drop policy if exists "notifications_select_own" on notifications;
create policy "notifications_select_own" on notifications for select using (auth.uid() = user_id);

drop policy if exists "notifications_update_own" on notifications;
create policy "notifications_update_own" on notifications for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- (insert de notificaciones únicamente vía triggers SECURITY DEFINER; sin policy de insert para clientes)
