import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCount } from '@/lib/utils';

export function UserCard({
  user,
}: {
  user: { username: string; full_name: string; avatar_url: string | null; followers_count: number };
}) {
  return (
    <Link href={`/user/${user.username}`} className="flex w-28 flex-shrink-0 flex-col items-center gap-2 text-center">
      <Avatar className="h-16 w-16">
        <AvatarImage src={user.avatar_url ?? undefined} />
        <AvatarFallback className="text-lg">{user.full_name.slice(0, 1).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="truncate text-sm font-semibold">@{user.username}</p>
        <p className="text-xs text-muted-foreground">{formatCount(user.followers_count)} seguidores</p>
      </div>
    </Link>
  );
}
