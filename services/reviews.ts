import type { ReviewWithAuthor } from '@/types';
import type { TypedSupabaseClient } from './types';

export async function listRecipeReviews(supabase: TypedSupabaseClient, recipeId: string): Promise<ReviewWithAuthor[]> {
  const { data, error } = await supabase
    .from('recipe_reviews')
    .select('*, author:profiles!recipe_reviews_user_id_fkey(id, username, full_name, avatar_url)')
    .eq('recipe_id', recipeId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReviewWithAuthor[];
}

export async function canReviewRecipe(supabase: TypedSupabaseClient, userId: string, recipeId: string) {
  const { data: madeIt } = await supabase
    .from('post_recipe_links')
    .select('post_id, posts!inner(user_id)')
    .eq('recipe_id', recipeId)
    .eq('posts.user_id', userId)
    .limit(1);
  if (!madeIt?.length) return false;

  const { data: existingReview } = await supabase
    .from('recipe_reviews')
    .select('id')
    .eq('recipe_id', recipeId)
    .eq('user_id', userId)
    .maybeSingle();
  return !existingReview;
}

export async function createReview(
  supabase: TypedSupabaseClient,
  userId: string,
  input: { recipeId: string; rating: number; difficultyFeedback?: string | null; comment?: string }
) {
  const { data, error } = await supabase
    .from('recipe_reviews')
    .insert({
      user_id: userId,
      recipe_id: input.recipeId,
      rating: input.rating,
      difficulty_feedback: (input.difficultyFeedback as any) ?? null,
      comment: input.comment ?? '',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
