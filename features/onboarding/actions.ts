'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { setUserPreferences } from '@/services/categories';

export async function completeOnboardingAction(categoryIds: string[]) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  await setUserPreferences(supabase, user.id, categoryIds);
  redirect('/feed');
}
