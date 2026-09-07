import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfileById, listFollowing } from '@/services/profiles';
import { getForYouFeed } from '@/services/feed';
import { getUnreadNotificationCount } from '@/services/notifications';
import { FeedHeader } from '@/components/feed/feed-header';
import { FeedView } from '@/components/feed/feed-view';

export default async function FeedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await getProfileById(supabase, user.id);
  if (!profile) redirect('/login');

  const [initialItems, following, unreadCount] = await Promise.all([
    getForYouFeed(supabase, user.id, { limit: 8, offset: 0 }),
    listFollowing(supabase, user.id),
    getUnreadNotificationCount(supabase, user.id),
  ]);

  return (
    <div>
      <FeedHeader avatarUrl={profile.avatar_url} fullName={profile.full_name} unreadCount={unreadCount} />
      <div className="mx-auto max-w-lg px-4 py-4">
        <FeedView initialItems={initialItems} isAuthenticated hasFollowing={following.length > 0} />
      </div>
    </div>
  );
}
