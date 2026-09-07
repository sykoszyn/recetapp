'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRIMARY_NAV, profileNavItem } from './nav-items';

export function BottomNav({ username, avatarUrl }: { username: string; avatarUrl: string | null }) {
  const pathname = usePathname();
  const items = [...PRIMARY_NAV.slice(0, 2), null, ...PRIMARY_NAV.slice(2), profileNavItem(username)];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur safe-bottom md:hidden">
      <div className="flex h-[4.25rem] items-center justify-between px-2">
        {items.map((item, index) => {
          if (item === null) {
            return (
              <Link
                key="create"
                href="/create"
                aria-label="Crear"
                className="relative -top-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-float transition-transform active:scale-90"
              >
                <Plus className="h-7 w-7" />
              </Link>
            );
          }

          const isProfile = item.href.startsWith('/user/');
          const isActive = isProfile ? pathname.startsWith('/user/') : pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px]"
              aria-current={isActive ? 'page' : undefined}
            >
              {isProfile && avatarUrl ? (
                <span
                  className={cn('h-6 w-6 overflow-hidden rounded-full border-2', isActive ? 'border-primary' : 'border-transparent')}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                </span>
              ) : (
                <Icon className={cn('h-6 w-6', isActive ? 'text-primary' : 'text-muted-foreground')} strokeWidth={isActive ? 2.4 : 2} />
              )}
              <span className={cn(isActive ? 'font-semibold text-foreground' : 'text-muted-foreground')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
