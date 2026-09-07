import Link from 'next/link';
import { MessageCircle, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LikeButton } from '@/components/interactions/like-button';
import { ShareButton } from '@/components/interactions/share-button';
import { PostMediaViewer } from './post-media-viewer';
import { LinkedRecipeCard } from './linked-recipe-card';
import { formatRelativeTime } from '@/lib/utils';
import type { PostCardData } from '@/types';

export function PostFeedCard({ post, isAuthenticated }: { post: PostCardData; isAuthenticated: boolean }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-fade-up">
      <div className="flex items-center gap-3 p-4 pb-3">
        <Link href={`/user/${post.author.username}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={post.author.avatar_url ?? undefined} />
            <AvatarFallback>{post.author.full_name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/user/${post.author.username}`} className="truncate text-sm font-semibold hover:underline">
            @{post.author.username}
          </Link>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(post.created_at)}</p>
        </div>
        {post.rating && (
          <span className="flex items-center gap-1 text-sm font-medium text-warning-foreground">
            <Star className="h-4 w-4 fill-warning text-warning" /> {post.rating}
          </span>
        )}
      </div>

      <PostMediaViewer media={post.media} />

      {post.linked_recipe && <div className="mt-3"><LinkedRecipeCard recipe={post.linked_recipe} /></div>}

      <div className="flex items-center gap-4 px-4 pt-1">
        <LikeButton target="post" targetId={post.id} initialLiked={!!post.is_liked} initialCount={post.likes_count} isAuthenticated={isAuthenticated} />
        <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MessageCircle className="h-6 w-6" />
          <span className="font-medium">{post.comments_count}</span>
        </Link>
        <div className="ml-auto">
          <ShareButton url={`/post/${post.id}`} title="Mirá esta publicación en RecetApp" />
        </div>
      </div>

      {post.caption && (
        <p className="px-4 pb-4 pt-2 text-sm">
          <Link href={`/user/${post.author.username}`} className="mr-1.5 font-semibold hover:underline">
            @{post.author.username}
          </Link>
          {post.caption}
        </p>
      )}
    </article>
  );
}
