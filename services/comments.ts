import type { CommentWithAuthor } from '@/types';
import type { TypedSupabaseClient } from './types';

const COMMENT_SELECT = `*, author:profiles!comments_user_id_fkey(id, username, full_name, avatar_url)`;

export async function listComments(
  supabase: TypedSupabaseClient,
  target: { recipeId?: string; postId?: string },
  viewerId?: string | null
): Promise<CommentWithAuthor[]> {
  let query = supabase.from('comments').select(COMMENT_SELECT).eq('is_deleted', false);
  query = target.recipeId ? query.eq('recipe_id', target.recipeId) : query.eq('post_id', target.postId);

  const { data, error } = await query.order('created_at', { ascending: true });
  if (error) throw error;

  const all = (data ?? []) as CommentWithAuthor[];
  let likedIds = new Set<string>();
  if (viewerId && all.length) {
    const { data: likedRows } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', viewerId)
      .in('comment_id', all.map((c) => c.id));
    likedIds = new Set((likedRows ?? []).map((r) => r.comment_id));
  }

  const byId = new Map(all.map((c) => [c.id, { ...c, is_liked: likedIds.has(c.id), replies: [] as CommentWithAuthor[] }]));
  const roots: CommentWithAuthor[] = [];
  for (const comment of byId.values()) {
    if (comment.parent_comment_id && byId.has(comment.parent_comment_id)) {
      byId.get(comment.parent_comment_id)!.replies!.push(comment);
    } else {
      roots.push(comment);
    }
  }
  return roots;
}

export async function createComment(
  supabase: TypedSupabaseClient,
  userId: string,
  input: { recipeId?: string; postId?: string; body: string; parentCommentId?: string | null }
) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      user_id: userId,
      recipe_id: input.recipeId ?? null,
      post_id: input.postId ?? null,
      parent_comment_id: input.parentCommentId ?? null,
      body: input.body,
    })
    .select(COMMENT_SELECT)
    .single();
  if (error) throw error;
  return data as CommentWithAuthor;
}

export async function deleteComment(supabase: TypedSupabaseClient, commentId: string) {
  const { error } = await supabase.from('comments').delete().eq('id', commentId);
  if (error) throw error;
}

export async function toggleCommentLike(supabase: TypedSupabaseClient, userId: string, commentId: string, like: boolean) {
  if (like) {
    const { error } = await supabase.from('comment_likes').insert({ user_id: userId, comment_id: commentId });
    if (error && error.code !== '23505') throw error;
  } else {
    const { error } = await supabase.from('comment_likes').delete().eq('user_id', userId).eq('comment_id', commentId);
    if (error) throw error;
  }
}
