'use server';

import { createClient } from '@/lib/supabase/server';
import { toggleRecipeLike, toggleSaveRecipe } from '@/services/recipes';
import { togglePostLike } from '@/services/posts';
import { followUser, unfollowUser } from '@/services/profiles';

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Necesitás iniciar sesión.');
  return { supabase, userId: user.id };
}

export async function toggleRecipeLikeAction(recipeId: string, like: boolean) {
  const { supabase, userId } = await requireUser();
  await toggleRecipeLike(supabase, userId, recipeId, like);
}

export async function toggleSaveRecipeAction(recipeId: string, save: boolean) {
  const { supabase, userId } = await requireUser();
  await toggleSaveRecipe(supabase, userId, recipeId, save);
}

export async function togglePostLikeAction(postId: string, like: boolean) {
  const { supabase, userId } = await requireUser();
  await togglePostLike(supabase, userId, postId, like);
}

export async function toggleFollowAction(targetUserId: string, follow: boolean) {
  const { supabase, userId } = await requireUser();
  if (userId === targetUserId) return;
  if (follow) await followUser(supabase, userId, targetUserId);
  else await unfollowUser(supabase, userId, targetUserId);
}
