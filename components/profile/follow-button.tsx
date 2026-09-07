'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleFollowAction } from '@/features/interactions/actions';

export function FollowButton({
  targetUserId,
  initialFollowing,
  isAuthenticated,
  size = 'default',
}: {
  targetUserId: string;
  initialFollowing: boolean;
  isAuthenticated: boolean;
  size?: 'default' | 'sm';
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setLoading(true);
    const next = !following;
    setFollowing(next);
    try {
      await toggleFollowAction(targetUserId, next);
    } catch {
      setFollowing(!next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={following ? 'outline' : 'default'} size={size} onClick={handleClick} disabled={loading}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {following ? 'Siguiendo' : 'Seguir'}
    </Button>
  );
}
