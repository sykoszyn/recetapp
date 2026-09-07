-- RecetApp — 0002: funciones y triggers (contadores, notificaciones, perfil automático).

-- ── updated_at genérico ─────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

drop trigger if exists trg_recipes_updated_at on recipes;
create trigger trg_recipes_updated_at before update on recipes
  for each row execute function set_updated_at();

drop trigger if exists trg_posts_updated_at on posts;
create trigger trg_posts_updated_at before update on posts
  for each row execute function set_updated_at();

drop trigger if exists trg_comments_updated_at on comments;
create trigger trg_comments_updated_at before update on comments
  for each row execute function set_updated_at();

drop trigger if exists trg_reviews_updated_at on recipe_reviews;
create trigger trg_reviews_updated_at before update on recipe_reviews
  for each row execute function set_updated_at();

-- ── Alta automática de perfil al registrarse ────────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    '[^a-z0-9_.]', '', 'g'
  ));
  if base_username is null or length(base_username) < 3 then
    base_username := 'user' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;
  final_username := base_username;

  while exists (select 1 from profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── Contador de seguidores/seguidos ─────────────────────────────────────
create or replace function handle_follow_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update profiles set following_count = following_count + 1 where id = new.follower_id;
    update profiles set followers_count = followers_count + 1 where id = new.following_id;
    insert into notifications (user_id, actor_id, type)
    values (new.following_id, new.follower_id, 'follow');
  elsif tg_op = 'DELETE' then
    update profiles set following_count = greatest(following_count - 1, 0) where id = old.follower_id;
    update profiles set followers_count = greatest(followers_count - 1, 0) where id = old.following_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_followers_change on followers;
create trigger trg_followers_change
  after insert or delete on followers
  for each row execute function handle_follow_change();

-- ── Likes de posts ───────────────────────────────────────────────────────
create or replace function handle_post_like_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid;
begin
  if tg_op = 'INSERT' then
    update posts set likes_count = likes_count + 1 where id = new.post_id returning user_id into owner;
    if owner is not null and owner <> new.user_id then
      insert into notifications (user_id, actor_id, type, post_id)
      values (owner, new.user_id, 'like_post', new.post_id);
    end if;
  elsif tg_op = 'DELETE' then
    update posts set likes_count = greatest(likes_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_post_likes_change on likes;
create trigger trg_post_likes_change
  after insert or delete on likes
  for each row execute function handle_post_like_change();

-- ── Likes de recetas ─────────────────────────────────────────────────────
create or replace function handle_recipe_like_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid;
begin
  if tg_op = 'INSERT' then
    update recipes set likes_count = likes_count + 1 where id = new.recipe_id returning user_id into owner;
    if owner is not null and owner <> new.user_id then
      insert into notifications (user_id, actor_id, type, recipe_id)
      values (owner, new.user_id, 'like_recipe', new.recipe_id);
    end if;
  elsif tg_op = 'DELETE' then
    update recipes set likes_count = greatest(likes_count - 1, 0) where id = old.recipe_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_recipe_likes_change on recipe_likes;
create trigger trg_recipe_likes_change
  after insert or delete on recipe_likes
  for each row execute function handle_recipe_like_change();

-- ── Likes de comentarios ──────────────────────────────────────────────────
create or replace function handle_comment_like_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update comments set likes_count = likes_count + 1 where id = new.comment_id;
  elsif tg_op = 'DELETE' then
    update comments set likes_count = greatest(likes_count - 1, 0) where id = old.comment_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_comment_likes_change on comment_likes;
create trigger trg_comment_likes_change
  after insert or delete on comment_likes
  for each row execute function handle_comment_like_change();

-- ── Comentarios (contador + notificación a dueño / respuesta) ───────────
create or replace function handle_comment_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_owner uuid;
  parent_owner uuid;
begin
  if new.recipe_id is not null then
    update recipes set comments_count = comments_count + 1 where id = new.recipe_id returning user_id into target_owner;
  else
    update posts set comments_count = comments_count + 1 where id = new.post_id returning user_id into target_owner;
  end if;

  if new.parent_comment_id is not null then
    select user_id into parent_owner from comments where id = new.parent_comment_id;
    if parent_owner is not null and parent_owner <> new.user_id then
      insert into notifications (user_id, actor_id, type, recipe_id, post_id, comment_id)
      values (parent_owner, new.user_id, 'reply_comment', new.recipe_id, new.post_id, new.id);
    end if;
  elsif target_owner is not null and target_owner <> new.user_id then
    insert into notifications (user_id, actor_id, type, recipe_id, post_id, comment_id)
    values (
      target_owner, new.user_id,
      case when new.recipe_id is not null then 'comment_recipe' else 'comment_post' end,
      new.recipe_id, new.post_id, new.id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_comment_insert on comments;
create trigger trg_comment_insert
  after insert on comments
  for each row execute function handle_comment_insert();

create or replace function handle_comment_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.recipe_id is not null then
    update recipes set comments_count = greatest(comments_count - 1, 0) where id = old.recipe_id;
  else
    update posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_comment_delete on comments;
create trigger trg_comment_delete
  after delete on comments
  for each row execute function handle_comment_delete();

-- ── Guardados (contador + notificación de hito) ──────────────────────────
create or replace function handle_saved_recipe_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid;
  new_count int;
begin
  if tg_op = 'INSERT' then
    update recipes set saves_count = saves_count + 1 where id = new.recipe_id
      returning saves_count, user_id into new_count, owner;
    if owner is not null and new_count in (100, 500, 1000, 5000) then
      insert into notifications (user_id, actor_id, type, recipe_id)
      values (owner, null, 'milestone_saves', new.recipe_id);
    end if;
  elsif tg_op = 'DELETE' then
    update recipes set saves_count = greatest(saves_count - 1, 0) where id = old.recipe_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_saved_recipes_change on saved_recipes;
create trigger trg_saved_recipes_change
  after insert or delete on saved_recipes
  for each row execute function handle_saved_recipe_change();

-- ── Contadores de perfil (recetas publicadas / publicaciones) ───────────
create or replace function handle_recipe_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'published' then
      update profiles set recipes_count = recipes_count + 1 where id = new.user_id;
    end if;
  elsif tg_op = 'UPDATE' then
    if old.status <> 'published' and new.status = 'published' then
      update profiles set recipes_count = recipes_count + 1 where id = new.user_id;
    elsif old.status = 'published' and new.status <> 'published' then
      update profiles set recipes_count = greatest(recipes_count - 1, 0) where id = new.user_id;
    end if;
  elsif tg_op = 'DELETE' then
    if old.status = 'published' then
      update profiles set recipes_count = greatest(recipes_count - 1, 0) where id = old.user_id;
    end if;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_recipe_status_change on recipes;
create trigger trg_recipe_status_change
  after insert or update of status or delete on recipes
  for each row execute function handle_recipe_status_change();

create or replace function handle_post_count_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update profiles set posts_count = posts_count + 1 where id = new.user_id;
  elsif tg_op = 'DELETE' then
    update profiles set posts_count = greatest(posts_count - 1, 0) where id = old.user_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_post_count_change on posts;
create trigger trg_post_count_change
  after insert or delete on posts
  for each row execute function handle_post_count_change();

-- ── "Así les quedó": vínculo post↔receta ─────────────────────────────────
create or replace function handle_post_recipe_link_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner uuid;
  actor uuid;
begin
  if tg_op = 'INSERT' then
    update recipes set cooked_count = cooked_count + 1 where id = new.recipe_id returning user_id into owner;
    select user_id into actor from posts where id = new.post_id;
    if owner is not null and actor is not null and owner <> actor then
      insert into notifications (user_id, actor_id, type, recipe_id, post_id)
      values (owner, actor, 'recipe_cooked', new.recipe_id, new.post_id);
    end if;
  elsif tg_op = 'DELETE' then
    update recipes set cooked_count = greatest(cooked_count - 1, 0) where id = old.recipe_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_post_recipe_link_change on post_recipe_links;
create trigger trg_post_recipe_link_change
  after insert or delete on post_recipe_links
  for each row execute function handle_post_recipe_link_change();

-- ── Vistas de receta ──────────────────────────────────────────────────────
create or replace function handle_recipe_view_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update recipes set views_count = views_count + 1 where id = new.recipe_id;
  return null;
end;
$$;

drop trigger if exists trg_recipe_view_insert on recipe_views;
create trigger trg_recipe_view_insert
  after insert on recipe_views
  for each row execute function handle_recipe_view_insert();

-- ── Valoraciones (recalcula promedio) ────────────────────────────────────
create or replace function recalc_recipe_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_recipe uuid;
begin
  target_recipe := coalesce(new.recipe_id, old.recipe_id);
  update recipes r
  set rating_avg = coalesce((select round(avg(rating), 2) from recipe_reviews where recipe_id = target_recipe), 0),
      rating_count = (select count(*) from recipe_reviews where recipe_id = target_recipe)
  where r.id = target_recipe;
  return null;
end;
$$;

drop trigger if exists trg_recipe_reviews_change on recipe_reviews;
create trigger trg_recipe_reviews_change
  after insert or update of rating or delete on recipe_reviews
  for each row execute function recalc_recipe_rating();
