import type { PostCardData } from '@/types';
import type { TypedSupabaseClient } from './types';

const POST_CARD_SELECT = `
  *,
  author:profiles!posts_user_id_fkey(id, username, full_name, avatar_url),
  media:post_media(id, media_type, url, thumbnail_url, position),
  post_recipe_links(recipe:recipes(id, title, slug, cover_image_url, author:profiles!recipes_user_id_fkey(username)))
`;

function normalizePostRow(row: any, viewerId?: string | null, likedPostIds?: Set<string>): PostCardData {
  const link = row.post_recipe_links?.[0]?.recipe ?? null;
  return {
    ...row,
    media: (row.media ?? []).sort((a: any, b: any) => a.position - b.position),
    linked_recipe: link
      ? {
          id: link.id,
          title: link.title,
          slug: link.slug,
          cover_image_url: link.cover_image_url,
          author_username: link.author?.username ?? '',
        }
      : null,
    is_liked: likedPostIds ? likedPostIds.has(row.id) : undefined,
  };
}

async function attachLikedState(supabase: TypedSupabaseClient, viewerId: string | null | undefined, postIds: string[]) {
  if (!viewerId || !postIds.length) return new Set<string>();
  const { data } = await supabase.from('likes').select('post_id').eq('user_id', viewerId).in('post_id', postIds);
  return new Set((data ?? []).map((row) => row.post_id));
}

export interface CreatePostInput {
  caption: string;
  rating?: number | null;
  difficulty_feedback?: 'muy_facil' | 'facil' | 'normal' | 'dificil' | null;
  recipe_id?: string | null;
  media: { media_type: 'image' | 'video'; url: string; thumbnail_url?: string | null }[];
}

export async function createPost(supabase: TypedSupabaseClient, userId: string, input: CreatePostInput) {
  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      caption: input.caption,
      rating: input.rating ?? null,
      difficulty_feedback: input.difficulty_feedback ?? null,
    })
    .select()
    .single();
  if (error) throw error;

  if (input.media.length) {
    const { error: mediaError } = await supabase
      .from('post_media')
      .insert(input.media.map((m, index) => ({ post_id: post.id, position: index, ...m })));
    if (mediaError) throw mediaError;
  }

  if (input.recipe_id) {
    const { error: linkError } = await supabase
      .from('post_recipe_links')
      .insert({ post_id: post.id, recipe_id: input.recipe_id });
    if (linkError) throw linkError;
  }

  return post;
}

export async function deletePost(supabase: TypedSupabaseClient, postId: string) {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function getPostById(supabase: TypedSupabaseClient, postId: string, viewerId?: string | null) {
  const { data, error } = await supabase.from('posts').select(POST_CARD_SELECT).eq('id', postId).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const liked = await attachLikedState(supabase, viewerId, [data.id]);
  return normalizePostRow(data, viewerId, liked);
}

export async function listRecentPosts(supabase: TypedSupabaseClient, options: { limit?: number; offset?: number; viewerId?: string | null } = {}) {
  const { limit = 20, offset = 0, viewerId } = options;
  const { data, error } = await supabase
    .from('posts')
    .select(POST_CARD_SELECT)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  const liked = await attachLikedState(supabase, viewerId, (data ?? []).map((p) => p.id));
  return (data ?? []).map((row) => normalizePostRow(row, viewerId, liked));
}

export async function listFollowingPosts(
  supabase: TypedSupabaseClient,
  followedUserIds: string[],
  options: { limit?: number; offset?: number; viewerId?: string | null } = {}
) {
  if (!followedUserIds.length) return [];
  const { limit = 20, offset = 0, viewerId } = options;
  const { data, error } = await supabase
    .from('posts')
    .select(POST_CARD_SELECT)
    .in('user_id', followedUserIds)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  const liked = await attachLikedState(supabase, viewerId, (data ?? []).map((p) => p.id));
  return (data ?? []).map((row) => normalizePostRow(row, viewerId, liked));
}

export async function getUserPosts(supabase: TypedSupabaseClient, userId: string, viewerId?: string | null) {
  const { data, error } = await supabase
    .from('posts')
    .select(POST_CARD_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const liked = await attachLikedState(supabase, viewerId, (data ?? []).map((p) => p.id));
  return (data ?? []).map((row) => normalizePostRow(row, viewerId, liked));
}

export async function getRecipeResultPosts(supabase: TypedSupabaseClient, recipeId: string, viewerId?: string | null, limit = 24) {
  const { data: links, error: linksError } = await supabase
    .from('post_recipe_links')
    .select('post_id')
    .eq('recipe_id', recipeId)
    .limit(limit);
  if (linksError) throw linksError;
  const postIds = (links ?? []).map((l) => l.post_id);
  if (!postIds.length) return [];

  const { data, error } = await supabase
    .from('posts')
    .select(POST_CARD_SELECT)
    .in('id', postIds)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const liked = await attachLikedState(supabase, viewerId, postIds);
  return (data ?? []).map((row) => normalizePostRow(row, viewerId, liked));
}

export async function togglePostLike(supabase: TypedSupabaseClient, userId: string, postId: string, like: boolean) {
  if (like) {
    const { error } = await supabase.from('likes').insert({ user_id: userId, post_id: postId });
    if (error && error.code !== '23505') throw error;
  } else {
    const { error } = await supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId);
    if (error) throw error;
  }
}

/** Recetas que el usuario hizo recientemente (para asociar en una nueva publicación). */
export async function getRecentlyCookedRecipeIds(supabase: TypedSupabaseClient, userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('posts')
    .select('post_recipe_links(recipe_id)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return Array.from(
    new Set((data ?? []).flatMap((row: any) => row.post_recipe_links?.map((l: any) => l.recipe_id) ?? []))
  );
}
