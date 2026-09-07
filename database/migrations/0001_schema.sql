-- RecetApp — 0001: extensiones, enums, tablas, índices y constraints.
-- Ejecutar en orden (Supabase → SQL Editor, o `supabase db push`).

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- búsqueda por similitud (ILIKE rápido)

-- ── ENUMS ───────────────────────────────────────────────────────────────
do $$ begin
  create type difficulty_level as enum ('facil', 'media', 'dificil');
exception when duplicate_object then null; end $$;

do $$ begin
  create type recipe_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

do $$ begin
  create type media_type as enum ('image', 'video');
exception when duplicate_object then null; end $$;

do $$ begin
  create type difficulty_feedback as enum ('muy_facil', 'facil', 'normal', 'dificil');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'like_post', 'like_recipe', 'follow', 'comment_recipe', 'comment_post',
    'reply_comment', 'recipe_cooked', 'milestone_saves'
  );
exception when duplicate_object then null; end $$;

-- ── PROFILES ────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null default '',
  avatar_url text,
  bio text default '',
  website text,
  followers_count integer not null default 0,
  following_count integer not null default 0,
  recipes_count integer not null default 0,
  posts_count integer not null default 0,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-z0-9_.]{3,30}$')
);
create index if not exists idx_profiles_username_trgm on profiles using gin (username gin_trgm_ops);
create index if not exists idx_profiles_full_name_trgm on profiles using gin (full_name gin_trgm_ops);

-- ── CATEGORIES ──────────────────────────────────────────────────────────
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  emoji text not null default '🍽️',
  created_at timestamptz not null default now()
);

-- preferencias elegidas en el onboarding (many-to-many usuario↔categoría)
create table if not exists user_preferences (
  user_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, category_id)
);

-- ── INGREDIENTS + CONVERSIONES POR INGREDIENTE ─────────────────────────
create table if not exists ingredients (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists idx_ingredients_name_trgm on ingredients using gin (name gin_trgm_ops);

-- gramos equivalentes a 1 taza / 1 cucharada / 1 cucharadita de este
-- ingrediente específico. Nunca se debe convertir volumen↔peso genéricamente:
-- harina, azúcar y agua pesan distinto por taza.
create table if not exists ingredient_conversions (
  ingredient_id uuid primary key references ingredients(id) on delete cascade,
  grams_per_cup numeric(10, 2) not null,
  grams_per_tablespoon numeric(10, 2) not null,
  grams_per_teaspoon numeric(10, 2) not null,
  notes text,
  updated_at timestamptz not null default now()
);

-- ── RECIPES ─────────────────────────────────────────────────────────────
create table if not exists recipes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text default '',
  cover_image_url text,
  video_url text,
  video_thumbnail_url text,
  difficulty difficulty_level not null default 'facil',
  prep_time_minutes integer check (prep_time_minutes >= 0),
  cook_time_minutes integer check (cook_time_minutes >= 0),
  servings integer not null default 4 check (servings > 0),
  notes text default '',
  status recipe_status not null default 'draft',
  calories_per_serving integer check (calories_per_serving >= 0),
  protein_grams numeric(6, 1),
  carbs_grams numeric(6, 1),
  fat_grams numeric(6, 1),
  likes_count integer not null default 0,
  saves_count integer not null default 0,
  comments_count integer not null default 0,
  views_count integer not null default 0,
  cooked_count integer not null default 0,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_recipes_user_id on recipes(user_id);
create index if not exists idx_recipes_status on recipes(status);
create index if not exists idx_recipes_published_at on recipes(published_at desc);
create index if not exists idx_recipes_title_trgm on recipes using gin (title gin_trgm_ops);
create index if not exists idx_recipes_likes_count on recipes(likes_count desc);

create table if not exists recipe_categories (
  recipe_id uuid not null references recipes(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (recipe_id, category_id)
);
create index if not exists idx_recipe_categories_category on recipe_categories(category_id);

create table if not exists recipe_ingredients (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  position integer not null default 0,
  quantity numeric(10, 2),
  unit text,
  ingredient_id uuid references ingredients(id) on delete set null,
  name_snapshot text not null,
  notes text
);
create index if not exists idx_recipe_ingredients_recipe on recipe_ingredients(recipe_id, position);

create table if not exists recipe_steps (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  position integer not null default 0,
  title text,
  description text not null,
  image_url text,
  video_url text,
  timer_seconds integer check (timer_seconds >= 0)
);
create index if not exists idx_recipe_steps_recipe on recipe_steps(recipe_id, position);

create table if not exists recipe_media (
  id uuid primary key default uuid_generate_v4(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  media_type media_type not null default 'image',
  url text not null,
  thumbnail_url text,
  position integer not null default 0
);
create index if not exists idx_recipe_media_recipe on recipe_media(recipe_id, position);

create table if not exists recipe_tags (
  recipe_id uuid not null references recipes(id) on delete cascade,
  tag text not null,
  primary key (recipe_id, tag)
);
create index if not exists idx_recipe_tags_tag on recipe_tags(tag);

create table if not exists recipe_views (
  id bigint generated always as identity primary key,
  recipe_id uuid not null references recipes(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  viewed_at timestamptz not null default now()
);
create index if not exists idx_recipe_views_recipe on recipe_views(recipe_id, viewed_at desc);

-- ── POSTS ("cómo me quedó" / feed) ─────────────────────────────────────
create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  caption text default '',
  rating smallint check (rating between 1 and 5),
  difficulty_feedback difficulty_feedback,
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_posts_user_id on posts(user_id);
create index if not exists idx_posts_created_at on posts(created_at desc);

create table if not exists post_media (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references posts(id) on delete cascade,
  media_type media_type not null default 'image',
  url text not null,
  thumbnail_url text,
  position integer not null default 0
);
create index if not exists idx_post_media_post on post_media(post_id, position);

create table if not exists post_recipe_links (
  post_id uuid primary key references posts(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists idx_post_recipe_links_recipe on post_recipe_links(recipe_id);

-- ── LIKES (posts, recetas, comentarios) ────────────────────────────────
create table if not exists likes (
  user_id uuid not null references profiles(id) on delete cascade,
  post_id uuid not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index if not exists idx_likes_post on likes(post_id);

create table if not exists recipe_likes (
  user_id uuid not null references profiles(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);
create index if not exists idx_recipe_likes_recipe on recipe_likes(recipe_id);

-- ── COMMENTS (recetas y posts, con respuestas) ─────────────────────────
create table if not exists comments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  parent_comment_id uuid references comments(id) on delete cascade,
  body text not null check (char_length(btrim(body)) > 0),
  likes_count integer not null default 0,
  is_deleted boolean not null default false,
  is_hidden boolean not null default false, -- reservado para moderación
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comment_target_exactly_one check (
    (recipe_id is not null and post_id is null) or (recipe_id is null and post_id is not null)
  )
);
create index if not exists idx_comments_recipe on comments(recipe_id, created_at desc);
create index if not exists idx_comments_post on comments(post_id, created_at desc);
create index if not exists idx_comments_parent on comments(parent_comment_id);

create table if not exists comment_likes (
  user_id uuid not null references profiles(id) on delete cascade,
  comment_id uuid not null references comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

-- ── FOLLOWERS ───────────────────────────────────────────────────────────
create table if not exists followers (
  follower_id uuid not null references profiles(id) on delete cascade,
  following_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);
create index if not exists idx_followers_following on followers(following_id);

-- ── GUARDADOS Y COLECCIONES ─────────────────────────────────────────────
create table if not exists saved_recipes (
  user_id uuid not null references profiles(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, recipe_id)
);
create index if not exists idx_saved_recipes_recipe on saved_recipes(recipe_id);

create table if not exists collections (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  cover_image_url text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists collection_recipes (
  collection_id uuid not null references collections(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (collection_id, recipe_id)
);

-- ── VALORACIONES ────────────────────────────────────────────────────────
create table if not exists recipe_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  recipe_id uuid not null references recipes(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  difficulty_feedback difficulty_feedback,
  comment text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, recipe_id)
);
create index if not exists idx_recipe_reviews_recipe on recipe_reviews(recipe_id);

-- ── NOTIFICACIONES ──────────────────────────────────────────────────────
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade, -- destinatario
  actor_id uuid references profiles(id) on delete cascade, -- quién la generó
  type notification_type not null,
  recipe_id uuid references recipes(id) on delete cascade,
  post_id uuid references posts(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on notifications(user_id, created_at desc);
create index if not exists idx_notifications_unread on notifications(user_id) where is_read = false;
