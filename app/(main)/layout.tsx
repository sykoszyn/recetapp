import { createClient } from '@/lib/supabase/server';
import { getProfileById } from '@/services/profiles';
import { getUnreadNotificationCount } from '@/services/notifications';
import { AppShell, type AppShellUser } from '@/components/layout/app-shell';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let shellUser: AppShellUser | null = null;
  if (authUser) {
    const [profile, unreadCount] = await Promise.all([
      getProfileById(supabase, authUser.id),
      getUnreadNotificationCount(supabase, authUser.id),
    ]);
    if (profile) {
      shellUser = { username: profile.username, fullName: profile.full_name, avatarUrl: profile.avatar_url, unreadCount };
    }
  }

  return <AppShell user={shellUser}>{children}</AppShell>;
}
