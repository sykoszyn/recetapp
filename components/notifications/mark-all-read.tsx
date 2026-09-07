'use client';

import { useEffect, useRef } from 'react';
import { markAllNotificationsReadAction } from '@/features/notifications/actions';

/** Marca todas las notificaciones como leídas apenas se monta la pantalla. */
export function MarkAllRead() {
  const called = useRef(false);
  useEffect(() => {
    if (called.current) return;
    called.current = true;
    markAllNotificationsReadAction();
  }, []);
  return null;
}
