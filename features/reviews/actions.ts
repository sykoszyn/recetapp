'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { canReviewRecipe, createReview } from '@/services/reviews';

export async function createReviewAction(input: {
  recipeId: string;
  recipeSlug: string;
  rating: number;
  difficultyFeedback?: string | null;
  comment?: string;
}): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Necesitás iniciar sesión.' };

  const allowed = await canReviewRecipe(supabase, user.id, input.recipeId);
  if (!allowed) return { error: 'Solo podés valorar recetas que ya cocinaste.' };

  await createReview(supabase, user.id, input);
  revalidatePath(`/recipe/${input.recipeSlug}`);
  return {};
}
