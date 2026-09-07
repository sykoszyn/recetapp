import { createBrowserClient } from '@supabase/ssr';

// Nota: no se pasa el genérico `Database` acá — la versión instalada de
// @supabase/ssr/supabase-js requiere un `GenericSchema` con `Relationships`
// por tabla y `Views`/`Functions` a nivel de schema; mantenerlo sincronizado
// manualmente no compensa el costo frente al tipado explícito que ya hacemos
// en cada función de `services/*` (que sí declaran su tipo de retorno real).
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
