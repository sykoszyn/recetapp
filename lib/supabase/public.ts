import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { disableRealtimeOption } from './disable-realtime';

/**
 * Cliente público de solo lectura, sin manejo de cookies/sesión.
 * Se usa en metadata routes (sitemap.ts) que Next.js puede ejecutar en
 * tiempo de build: ahí `next/headers` no tiene un request scope real, y
 * `lib/supabase/server.ts` (que llama a `cookies()`) rompe el build.
 * El contenido que consulta es público (recetas publicadas), así que el
 * anon key alcanza — no hace falta sesión de usuario.
 */
export function createPublicClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    ...disableRealtimeOption,
  });
}
