'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';
import { toggleRecipeLikeAction, togglePostLikeAction } from '@/features/interactions/actions';

export function LikeButton({
  target,
  targetId,
  initialLiked,
  initialCount,
  isAuthenticated,
  size = 'default',
}: {
  target: 'recipe' | 'post';
  targetId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
  size?: 'default' | 'sm';
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  async function handleClick() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const next = !liked;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    setAnimating(next);

    try {
      if (target === 'recipe') await toggleRecipeLikeAction(targetId, next);
      else await togglePostLikeAction(targetId, next);
    } catch {
      setLiked(!next);
      setCount((c) => c + (next ? -1 : 1));
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
      className="flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <Heart
        onAnimationEnd={() => setAnimating(false)}
        className={cn(
          size === 'sm' ? 'h-5 w-5' : 'h-6 w-6',
          liked ? 'fill-destructive text-destructive' : 'text-foreground',
          animating && 'animate-heart-pop'
        )}
      />
      <span className={cn('font-medium', liked && 'text-destructive')}>{formatCount(count)}</span>
    </button>
  );
}
