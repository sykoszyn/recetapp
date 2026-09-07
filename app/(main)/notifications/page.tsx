import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listNotifications } from '@/services/notifications';
import { NotificationItem } from '@/components/notifications/notification-item';
import { MarkAllRead } from '@/components/notifications/mark-all-read';
import { EmptyState } from '@/components/empty-state';

export default async function NotificationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const notifications = await listNotifications(supabase, user.id);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 safe-top">
      <MarkAllRead />
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Notificaciones</h1>

      {notifications.length === 0 ? (
        <EmptyState emoji="🔔" title="Sin notificaciones todavía" description="Cuando alguien interactúe con tu contenido, lo vas a ver acá." />
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
