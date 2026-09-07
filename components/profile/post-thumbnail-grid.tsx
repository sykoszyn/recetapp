import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import type { PostCardData } from '@/types';

export function PostThumbnailGrid({ posts, emptyMessage }: { posts: PostCardData[]; emptyMessage: string }) {
  if (!posts.length) return <EmptyState emoji="📸" title={emptyMessage} />;

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => {
        const media = post.media[0];
        return (
          <Link key={post.id} href={`/post/${post.id}`} className="group relative aspect-square overflow-hidden bg-muted">
            {media &&
              (media.media_type === 'video' ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={media.url} className="h-full w-full object-cover" muted />
              ) : (
                <Image src={media.url} alt="" fill sizes="200px" className="object-cover" />
              ))}
            <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[11px] text-white">
              <Heart className="h-3 w-3 fill-white" /> {post.likes_count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
