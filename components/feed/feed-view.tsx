'use client';

import { useCallback, useRef, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecipeFeedCard } from './recipe-feed-card';
import { PostFeedCard } from './post-feed-card';
import { FeedSkeleton } from './feed-skeleton';
import { EmptyState } from '@/components/empty-state';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import type { FeedItem } from '@/services/feed';

const PAGE_SIZE = 8;

export function FeedView({
  initialItems,
  isAuthenticated,
  hasFollowing,
}: {
  initialItems: FeedItem[];
  isAuthenticated: boolean;
  hasFollowing: boolean;
}) {
  const [tab, setTab] = useState<'for_you' | 'following'>('for_you');
  const [itemsByTab, setItemsByTab] = useState<Record<string, FeedItem[]>>({ for_you: initialItems, following: [] });
  const [offsetByTab, setOffsetByTab] = useState<Record<string, number>>({ for_you: initialItems.length, following: 0 });
  const [hasMoreByTab, setHasMoreByTab] = useState<Record<string, boolean>>({ for_you: initialItems.length === PAGE_SIZE, following: true });
  const [loading, setLoading] = useState(false);
  const loadedFollowing = useRef(false);

  const items = itemsByTab[tab] ?? [];
  const hasMore = hasMoreByTab[tab];

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const offset = offsetByTab[tab] ?? 0;
      const res = await fetch(`/api/feed?tab=${tab}&offset=${offset}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      setItemsByTab((prev) => ({ ...prev, [tab]: [...(prev[tab] ?? []), ...data.items] }));
      setOffsetByTab((prev) => ({ ...prev, [tab]: offset + data.items.length }));
      setHasMoreByTab((prev) => ({ ...prev, [tab]: data.hasMore }));
    } finally {
      setLoading(false);
      loadedFollowing.current = true;
    }
  }, [tab, loading, hasMore, offsetByTab]);

  const sentinelRef = useInfiniteScroll(loadMore, hasMore && !loading);

  function handleTabChange(value: string) {
    const next = value as 'for_you' | 'following';
    setTab(next);
    if (next === 'following' && !loadedFollowing.current) {
      loadMore();
    }
  }

  return (
    <div>
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="for_you">Para ti</TabsTrigger>
          <TabsTrigger value="following">Siguiendo</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-4 space-y-5">
        {tab === 'following' && !hasFollowing && items.length === 0 && !loading ? (
          <EmptyState
            emoji="👀"
            title="Todavía no seguís a nadie"
            description="Seguí a otros usuarios para ver sus recetas y publicaciones acá."
            actionLabel="Descubrir usuarios"
            actionHref="/explore"
          />
        ) : (
          items.map((item) =>
            item.kind === 'recipe' ? (
              <RecipeFeedCard key={`recipe-${item.id}`} recipe={item} isAuthenticated={isAuthenticated} />
            ) : (
              <PostFeedCard key={`post-${item.id}`} post={item} isAuthenticated={isAuthenticated} />
            )
          )
        )}

        {loading && <FeedSkeleton />}
        {hasMore && <div ref={sentinelRef} className="h-1" />}
        {!hasMore && items.length > 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Ya viste todo por ahora 🎉</p>
        )}
      </div>
    </div>
  );
}
