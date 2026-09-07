import { Sidebar } from './sidebar';
import { BottomNav } from './bottom-nav';

export interface AppShellUser {
  username: string;
  fullName: string;
  avatarUrl: string | null;
  unreadCount: number;
}

export function AppShell({ user, children }: { user: AppShellUser | null; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {user && (
        <Sidebar username={user.username} fullName={user.fullName} avatarUrl={user.avatarUrl} unreadCount={user.unreadCount} />
      )}
      <main className={user ? 'pb-nav md:ml-64' : ''}>{children}</main>
      {user && <BottomNav username={user.username} avatarUrl={user.avatarUrl} />}
    </div>
  );
}
