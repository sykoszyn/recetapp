-- RecetApp — 0004: Storage buckets y policies.
-- Convención de rutas: {bucket}/{userId}/... — ej. recipes/{userId}/{recipeId}/imagen.jpg
-- Todos los buckets son de lectura pública (es contenido social) pero solo
-- el dueño de la carpeta ({userId} = auth.uid()) puede escribir/borrar ahí.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('recipes', 'recipes', true, 15728640, array['image/jpeg', 'image/png', 'image/webp']),
  ('posts', 'posts', true, 15728640, array['image/jpeg', 'image/png', 'image/webp']),
  ('recipe-videos', 'recipe-videos', true, 104857600, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- lectura pública de los 4 buckets
drop policy if exists "recetapp_public_read" on storage.objects;
create policy "recetapp_public_read" on storage.objects for select
  using (bucket_id in ('avatars', 'recipes', 'posts', 'recipe-videos'));

-- escritura/actualización/borrado: solo dentro de la carpeta propia ({userId}/...)
drop policy if exists "recetapp_owner_insert" on storage.objects;
create policy "recetapp_owner_insert" on storage.objects for insert
  with check (
    bucket_id in ('avatars', 'recipes', 'posts', 'recipe-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "recetapp_owner_update" on storage.objects;
create policy "recetapp_owner_update" on storage.objects for update
  using (
    bucket_id in ('avatars', 'recipes', 'posts', 'recipe-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "recetapp_owner_delete" on storage.objects;
create policy "recetapp_owner_delete" on storage.objects for delete
  using (
    bucket_id in ('avatars', 'recipes', 'posts', 'recipe-videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
