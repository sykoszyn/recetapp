import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { disableRealtimeOption } from './disable-realtime';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      ...disableRealtimeOption,
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // se llama desde un Server Component sin permiso de escritura;
            // el middleware ya se encarga de refrescar la sesión en ese caso.
          }
        },
      },
    }
  );
}
