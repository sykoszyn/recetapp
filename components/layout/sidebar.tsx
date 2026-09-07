'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, PlusCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PRIMARY_NAV, profileNavItem } from './nav-items';

export function Sidebar({
  username,
  fullName,
  avatarUrl,
  unreadCount,
}: {
  username: string;
  fullName: string;
  avatarUrl: string | null;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const items = [...PRIMARY_NAV, profileNavItem(username)];

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-background px-4 py-6 md:flex">
      <Link href="/feed" className="mb-8 px-2">
        <Logo />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const isProfile = item.href.startsWith('/user/');
          const isActive = isProfile ? pathname.startsWith('/user/') : pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted',
                isActive && 'bg-muted text-primary'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}

        <Link
          href="/notifications"
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-medium transition-colors hover:bg-muted',
            pathname === '/notifications' && 'bg-muted text-primary'
          )}
        >
          <span className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </span>
          Notificaciones
        </Link>

        <Link
          href="/create"
          className="mt-2 flex items-center gap-3 rounded-full bg-primary px-3 py-2.5 text-base font-semibold text-primary-foreground shadow-soft transition-transform hover:brightness-105 active:scale-95"
        >
          <PlusCircle className="h-5 w-5" />
          Crear
        </Link>
      </nav>

      <Link href="/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted">
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl ?? undefined} alt={fullName} />
          <AvatarFallback>{fullName.slice(0, 1).toUpperCase() || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col overflow-hidden">
          <span className="truncate font-medium">{fullName || username}</span>
          <span className="truncate text-xs text-muted-foreground">@{username}</span>
        </div>
        <Settings className="ml-auto h-4 w-4 text-muted-foreground" />
      </Link>
    </aside>
  );
}
