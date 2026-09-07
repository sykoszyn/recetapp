'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/empty-state';
import type { PublicProfile } from '@/types';

export function FollowListDialog({
  username,
  type,
  open,
  onOpenChange,
}: {
  username: string;
  type: 'followers' | 'following';
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [items, setItems] = useState<PublicProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/users/${username}/${type}`)
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, [open, username, type]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{type === 'followers' ? 'Seguidores' : 'Seguidos'}</DialogTitle>
        </DialogHeader>
        <div className="mt-3 space-y-1">
          {loading && <p className="py-6 text-center text-sm text-muted-foreground">Cargando...</p>}
          {!loading && items.length === 0 && <EmptyState emoji="👤" title="No hay nadie para mostrar" />}
          {items.map((profile) => (
            <Link
              key={profile.id}
              href={`/user/${profile.username}`}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile.avatar_url ?? undefined} />
                <AvatarFallback>{profile.full_name?.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{profile.full_name}</p>
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
              </div>
            </Link>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
