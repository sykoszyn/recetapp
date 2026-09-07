import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatRelativeTime } from '@/lib/utils';
import { NOTIFICATION_MESSAGES } from '@/types';
import type { NotificationWithActor } from '@/types';

function resolveHref(notification: NotificationWithActor) {
  if (notification.type === 'follow' && notification.actor) return `/user/${notification.actor.username}`;
  if (notification.post_id) return `/post/${notification.post_id}`;
  if (notification.recipe_slug) return `/recipe/${notification.recipe_slug}`;
  return '#';
}

export function NotificationItem({ notification }: { notification: NotificationWithActor }) {
  const actorName = notification.actor ? `@${notification.actor.username}` : 'Alguien';
  const message = NOTIFICATION_MESSAGES[notification.type](actorName);

  return (
    <Link
      href={resolveHref(notification)}
      className={cn('flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted', !notification.is_read && 'bg-primary/5')}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={notification.actor?.avatar_url ?? undefined} />
        <AvatarFallback>{(notification.actor?.full_name ?? '🍳').slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <p className="text-sm">{message}</p>
        <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.created_at)}</p>
      </div>
      {!notification.is_read && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
    </Link>
  );
}
