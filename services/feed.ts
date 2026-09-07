import type { PostCardData, RecipeCardData } from '@/types';
import type { TypedSupabaseClient } from './types';
import { listPublishedRecipes } from './recipes';
import { listFollowingPosts, listRecentPosts } from './posts';
import { getUserPreferredCategoryIds } from './categories';

export type FeedItem = ({ kind: 'recipe' } & RecipeCardData) | ({ kind: 'post' } & PostCardData);

function scoreRecipe(recipe: RecipeCardData, preferredCategoryIds: Set<string>) {
  const ageHours = (Date.now() - new Date(recipe.published_at ?? recipe.created_at).getTime()) / 3_600_000;
  const recencyBoost = Math.max(0, 72 - ageHours) / 72; // más peso las primeras 72hs
  const matchesPreference = recipe.categories.some((c) => preferredCategoryIds.has(c.id));
  return recipe.likes_count * 2 + recipe.saves_count * 3 + recipe.cooked_count * 2 + (matchesPreference ? 40 : 0) + recencyBoost * 20;
}

function scorePost(post: PostCardData) {
  const ageHours = (Date.now() - new Date(post.created_at).getTime()) / 3_600_000;
  const recencyBoost = Math.max(0, 72 - ageHours) / 72;
  return post.likes_count * 2 + post.comments_count * 3 + recencyBoost * 20;
}

/**
 * Feed "Para ti": algoritmo simple (sin IA) que combina popularidad reciente,
 * categorías preferidas del onboarding y qué tan nuevo es el contenido.
 * Trae una ventana acotada (no todo el catálogo) y la ordena en memoria.
 */
export async function getForYouFeed(
  supabase: TypedSupabaseClient,
  userId: string | null,
  { limit = 12, offset = 0 }: { limit?: number; offset?: number }
): Promise<FeedItem[]> {
  const windowSize = 40;
  const preferredIds = userId ? new Set(await getUserPreferredCategoryIds(supabase, userId)) : new Set<string>();

  const [recipes, posts] = await Promise.all([
    listPublishedRecipes(supabase, { limit: windowSize, orderBy: 'recent' }),
    listRecentPosts(supabase, { limit: windowSize, viewerId: userId }),
  ]);

  const items: FeedItem[] = [
    ...recipes.map((r) => ({ kind: 'recipe' as const, ...r, __score: scoreRecipe(r, preferredIds) })),
    ...posts.map((p) => ({ kind: 'post' as const, ...p, __score: scorePost(p) })),
  ].sort((a: any, b: any) => b.__score - a.__score);

  return items.slice(offset, offset + limit);
}

/** Feed "Siguiendo": solo contenido de usuarios seguidos, orden cronológico real. */
export async function getFollowingFeed(
  supabase: TypedSupabaseClient,
  followedUserIds: string[],
  { limit = 12, offset = 0 }: { limit?: number; offset?: number },
  viewerId?: string | null
): Promise<FeedItem[]> {
  if (!followedUserIds.length) return [];

  const [{ data: recipesRaw }, posts] = await Promise.all([
    supabase
      .from('recipes')
      .select(`*, author:profiles!recipes_user_id_fkey(id, username, full_name, avatar_url), categories:recipe_categories(category:categories(id, name, slug, emoji))`)
      .in('user_id', followedUserIds)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(30),
    listFollowingPosts(supabase, followedUserIds, { limit: 30, viewerId }),
  ]);

  const recipes: RecipeCardData[] = (recipesRaw ?? []).map((r: any) => ({
    ...r,
    categories: (r.categories ?? []).map((c: any) => c.category).filter(Boolean),
  }));

  const items: FeedItem[] = [
    ...recipes.map((r) => ({ kind: 'recipe' as const, ...r })),
    ...posts.map((p) => ({ kind: 'post' as const, ...p })),
  ].sort((a, b) => {
    const dateA = a.kind === 'recipe' ? a.published_at ?? a.created_at : a.created_at;
    const dateB = b.kind === 'recipe' ? b.published_at ?? b.created_at : b.created_at;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return items.slice(offset, offset + limit);
}
