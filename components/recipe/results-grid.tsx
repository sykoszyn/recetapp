import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { formatCount } from '@/lib/utils';
import type { PostCardData } from '@/types';

export function ResultsGrid({ posts, cookedCount }: { posts: PostCardData[]; cookedCount: number }) {
  return (
    <div>
      <h2 className="mb-1 text-lg font-bold">Así les quedó</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {cookedCount > 0 ? `Así les quedó a ${formatCount(cookedCount)} persona${cookedCount === 1 ? '' : 's'}.` : 'Todavía nadie compartió su resultado.'}
      </p>

      {posts.length === 0 ? (
        <EmptyState emoji="📸" title="Sé el primero en mostrar cómo te quedó" />
      ) : (
        <div className="grid grid-cols-3 gap-1.5 md:grid-cols-4">
          {posts.map((post) => {
            const media = post.media[0];
            return (
              <Link key={post.id} href={`/post/${post.id}`} className="group relative aspect-square overflow-hidden rounded-lg bg-muted">
                {media && (
                  media.media_type === 'video' ? (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video src={media.url} className="h-full w-full object-cover" muted />
                  ) : (
                    <Image src={media.url} alt="" fill sizes="200px" className="object-cover transition-transform group-hover:scale-105" />
                  )
                )}
                <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[11px] text-white">
                  <Heart className="h-3 w-3 fill-white" /> {post.likes_count}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
