# Migraciones de RecetApp

Ejecutar en **Supabase → SQL Editor** en este orden (o vía `supabase db push`
si usás el CLI apuntando a `database/migrations`):

1. `0001_schema.sql` — extensiones, enums, tablas, índices.
2. `0002_functions_and_triggers.sql` — perfil automático al registrarse, contadores, notificaciones.
3. `0003_rls_policies.sql` — Row Level Security de todas las tablas.
4. `0004_storage.sql` — buckets de Storage (`avatars`, `recipes`, `posts`, `recipe-videos`) y sus policies.
5. `0005_seed.sql` — categorías del onboarding + tabla de conversión gramos↔volumen por ingrediente.
6. `0006_rpc_functions.sql` — función `recipes_matching_ingredients` para "¿Qué puedo cocinar?".

Todos los archivos son idempotentes (podés volver a correrlos sin romper nada).

## Después de correr las migraciones

- **Authentication → URL Configuration**: agregá tu dominio de producción y
  `http://localhost:3000` en *Redirect URLs* (necesario para el callback de
  verificación de email y OAuth).
- **Authentication → Providers → Email**: dejá activado "Confirm email" para
  producción (el flujo de verificación ya está implementado en `/auth/confirm`).
- **Authentication → Providers → Google**: creá credenciales OAuth en Google
  Cloud Console y pegá Client ID/Secret acá.
- **Authentication → Providers → Apple**: configurá Services ID, Team ID, Key
  ID y la Private Key (requiere cuenta de Apple Developer).
