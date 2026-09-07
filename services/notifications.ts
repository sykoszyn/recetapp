import type { NotificationWithActor } from '@/types';
import type { TypedSupabaseClient } from './types';

export async function listNotifications(supabase: TypedSupabaseClient, userId: string, limit = 40): Promise<NotificationWithActor[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, actor:profiles!notifications_actor_id_fkey(id, username, full_name, avatar_url), recipe:recipes(title, slug)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    recipe_title: row.recipe?.title ?? null,
    recipe_slug: row.recipe?.slug ?? null,
  }));
}

export async function getUnreadNotificationCount(supabase: TypedSupabaseClient, userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) throw error;
  return count ?? 0;
}

export async function markNotificationRead(supabase: TypedSupabaseClient, notificationId: string) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
  if (error) throw error;
}

export async function markAllNotificationsRead(supabase: TypedSupabaseClient, userId: string) {
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
  if (error) throw error;
}
