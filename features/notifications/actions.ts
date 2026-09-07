'use server';

import { createClient } from '@/lib/supabase/server';
import { markAllNotificationsRead } from '@/services/notifications';

export async function markAllNotificationsReadAction() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await markAllNotificationsRead(supabase, user.id);
}
