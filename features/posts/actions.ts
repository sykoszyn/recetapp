'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createPost, deletePost, type CreatePostInput } from '@/services/posts';

export interface PostActionResult {
  error?: string;
  postId?: string;
}

export async function createPostAction(input: CreatePostInput): Promise<PostActionResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Necesitás iniciar sesión.' };

  if (!input.media.length) return { error: 'Agregá al menos una foto o video.' };

  const post = await createPost(supabase, user.id, input);
  revalidatePath('/feed');
  if (input.recipe_id) {
    const { data: recipe } = await supabase.from('recipes').select('slug').eq('id', input.recipe_id).maybeSingle();
    if (recipe) revalidatePath(`/recipe/${recipe.slug}`);
  }
  return { postId: post.id };
}

export async function deletePostAction(postId: string) {
  const supabase = createClient();
  await deletePost(supabase, postId);
  revalidatePath('/feed');
}
