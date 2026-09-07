'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatRelativeTime } from '@/lib/utils';
import { deleteCommentAction, toggleCommentLikeAction } from '@/features/comments/actions';
import type { CommentWithAuthor } from '@/types';

export function CommentItem({
  comment,
  currentUserId,
  onReply,
  depth = 0,
}: {
  comment: CommentWithAuthor;
  currentUserId: string | null;
  onReply: (comment: CommentWithAuthor) => void;
  depth?: number;
}) {
  const [liked, setLiked] = useState(!!comment.is_liked);
  const [likeCount, setLikeCount] = useState(comment.likes_count);
  const [deleted, setDeleted] = useState(false);

  async function handleLike() {
    if (!currentUserId) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    try {
      await toggleCommentLikeAction(comment.id, next);
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    }
  }

  async function handleDelete() {
    setDeleted(true);
    try {
      await deleteCommentAction(comment.id);
    } catch {
      setDeleted(false);
    }
  }

  if (deleted) return null;

  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-10 mt-3')}>
      <Link href={`/user/${comment.author.username}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar_url ?? undefined} />
          <AvatarFallback>{comment.author.full_name.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1">
        <p className="text-sm">
          <Link href={`/user/${comment.author.username}`} className="mr-1.5 font-semibold hover:underline">
            @{comment.author.username}
          </Link>
          {comment.body}
        </p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatRelativeTime(comment.created_at)}</span>
          <button type="button" onClick={handleLike} className={cn('flex items-center gap-1', liked && 'text-destructive')}>
            <Heart className={cn('h-3.5 w-3.5', liked && 'fill-destructive')} /> {likeCount > 0 && likeCount}
          </button>
          <button type="button" onClick={() => onReply(comment)}>
            Responder
          </button>
          {currentUserId === comment.user_id && (
            <button type="button" onClick={handleDelete} className="flex items-center gap-1 text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {comment.replies?.map((reply) => (
          <CommentItem key={reply.id} comment={reply} currentUserId={currentUserId} onReply={onReply} depth={depth + 1} />
        ))}
      </div>
    </div>
  );
}
