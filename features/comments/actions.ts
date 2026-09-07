'use server';

import { createClient } from '@/lib/supabase/server';
import { createComment, deleteComment, toggleCommentLike } from '@/services/comments';

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
  return { supabase, userId: user.id };
}

export async function createCommentAction(input: { recipeId?: string; postId?: string; body: string; parentCommentId?: string | null }) {
  const { supabase, userId } = await requireUser();
  if (!input.body.trim()) throw new Error('empty');
  return createComment(supabase, userId, input);
}

export async function deleteCommentAction(commentId: string) {
  const { supabase } = await requireUser();
  await deleteComment(supabase, commentId);
}

export async function toggleCommentLikeAction(commentId: string, like: boolean) {
  const { supabase, userId } = await requireUser();
  await toggleCommentLike(supabase, userId, commentId, like);
}
