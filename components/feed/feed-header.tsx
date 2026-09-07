import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function FeedHeader({
  avatarUrl,
  fullName,
  unreadCount,
}: {
  avatarUrl: string | null;
  fullName: string;
  unreadCount: number;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur safe-top">
      <Logo />
      <div className="flex items-center gap-3">
        <Link href="/explore" aria-label="Buscar" className="rounded-full p-2 hover:bg-muted">
          <Search className="h-5 w-5" />
        </Link>
        <Link href="/notifications" aria-label="Notificaciones" className="relative rounded-full p-2 hover:bg-muted">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        <Link href="/settings">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl ?? undefined} />
            <AvatarFallback>{fullName.slice(0, 1).toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
