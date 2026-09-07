'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { FollowButton } from './follow-button';
import { FollowListDialog } from './follow-list-dialog';
import { ShareButton } from '@/components/interactions/share-button';
import { formatCount } from '@/lib/utils';
import type { ProfileRow } from '@/types/database';

export function ProfileHeader({
  profile,
  isOwner,
  isFollowing,
  isAuthenticated,
}: {
  profile: ProfileRow;
  isOwner: boolean;
  isFollowing: boolean;
  isAuthenticated: boolean;
}) {
  const [dialog, setDialog] = useState<'followers' | 'following' | null>(null);

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-5">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-2xl">{profile.full_name.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex flex-1 justify-around text-center">
          <div>
            <p className="text-lg font-bold">{formatCount(profile.recipes_count)}</p>
            <p className="text-xs text-muted-foreground">Recetas</p>
          </div>
          <button onClick={() => setDialog('followers')}>
            <p className="text-lg font-bold">{formatCount(profile.followers_count)}</p>
            <p className="text-xs text-muted-foreground">Seguidores</p>
          </button>
          <button onClick={() => setDialog('following')}>
            <p className="text-lg font-bold">{formatCount(profile.following_count)}</p>
            <p className="text-xs text-muted-foreground">Seguidos</p>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <p className="font-semibold">{profile.full_name}</p>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>
        {profile.bio && <p className="mt-1.5 text-sm">{profile.bio}</p>}
        {profile.website && (
          <a href={profile.website} target="_blank" rel="noreferrer" className="mt-1 block text-sm font-medium text-primary">
            {profile.website.replace(/^https?:\/\//, '')}
          </a>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {isOwner ? (
          <Button variant="outline" className="flex-1" asChild>
            <a href="/settings">Editar perfil</a>
          </Button>
        ) : (
          <>
            <FollowButton targetUserId={profile.id} initialFollowing={isFollowing} isAuthenticated={isAuthenticated} />
            <Button variant="outline" className="flex-1 gap-2" disabled title="Disponible próximamente">
              <MessageCircle className="h-4 w-4" /> Mensaje
            </Button>
          </>
        )}
        <ShareButton url={`/user/${profile.username}`} title={`@${profile.username} en RecetApp`} />
      </div>

      <FollowListDialog username={profile.username} type="followers" open={dialog === 'followers'} onOpenChange={(o) => setDialog(o ? 'followers' : null)} />
      <FollowListDialog username={profile.username} type="following" open={dialog === 'following'} onOpenChange={(o) => setDialog(o ? 'following' : null)} />
    </div>
  );
}
