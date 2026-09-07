import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getForYouFeed, getFollowingFeed } from '@/services/feed';
import { listFollowing } from '@/services/profiles';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') === 'following' ? 'following' : 'for_you';
  const limit = Math.min(Number(searchParams.get('limit') ?? 8), 20);
  const offset = Math.max(Number(searchParams.get('offset') ?? 0), 0);

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (tab === 'following') {
    if (!user) return NextResponse.json({ items: [], hasMore: false });
    const following = await listFollowing(supabase, user.id);
    const followedIds = following.map((f: any) => f.id).filter(Boolean);
    const items = await getFollowingFeed(supabase, followedIds, { limit, offset }, user.id);
    return NextResponse.json({ items, hasMore: items.length === limit });
  }

  const items = await getForYouFeed(supabase, user?.id ?? null, { limit, offset });
  return NextResponse.json({ items, hasMore: items.length === limit });
}
