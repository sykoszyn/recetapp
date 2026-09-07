import type { SupabaseClient } from '@supabase/supabase-js';

// Cliente de Supabase sin el genérico de schema tipado (ver nota en
// lib/supabase/client.ts). Cada función de servicio declara su propio tipo
// de retorno explícito, que es lo que realmente protege al resto de la app.
export type TypedSupabaseClient = SupabaseClient;
