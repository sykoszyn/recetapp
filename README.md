# RecetApp

Plataforma social de recetas: descubrí recetas, guardalas, cocinalas y mostrale
al mundo cómo te quedaron. La conexión **receta → persona que la cocina →
resultado → nuevo usuario que la descubre** es el eje central de la app.

## Stack

- **Frontend:** Next.js 14 (App Router) + React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Postgres, Auth, Storage, Realtime implícito vía triggers)
- **Deploy web:** Vercel
- **Mobile (a futuro):** Capacitor (Android/iOS) envolviendo el sitio de producción

## Estructura del proyecto

```
recetapp/
├── app/                     # Rutas (App Router)
│   ├── page.tsx             # Landing pública
│   ├── login|register|forgot-password|reset-password/
│   ├── auth/confirm/         # Callback de email/OAuth/recovery
│   ├── onboarding/           # Selección de categorías tras registrarse
│   ├── (main)/                # Todo lo que vive dentro del shell con nav
│   │   ├── feed/               # Home autenticada (Para ti / Siguiendo)
│   │   ├── explore/            # Descubrir + buscador + ¿Qué puedo cocinar?
│   │   ├── recipe/[slug]/       # Página de receta, /edit y /cook (Modo Cocina)
│   │   ├── post/[id]/           # Publicación individual + comentarios
│   │   ├── user/[username]/      # Perfil público
│   │   ├── saved/                # Guardados + colecciones
│   │   ├── create/create/recipe/create/post/
│   │   ├── notifications/
│   │   └── settings/
│   └── api/                  # Route Handlers (feed, búsqueda, pickers)
├── components/               # UI reutilizable (ui/, feed/, recipe/, ...)
├── features/                 # Server Actions + validación por dominio
├── services/                 # Acceso a datos (Supabase queries), sin JSX
├── lib/                      # Supabase clients, conversor de medidas, utils
├── types/                    # Tipos de dominio + tipos de la base de datos
├── database/migrations/      # SQL: schema, triggers, RLS, storage, seed
├── public/                   # manifest.json, sw.js, íconos PWA
└── capacitor.config.ts
```

## 1. Poner en marcha Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor** → corré, en orden, cada archivo de `database/migrations/`
   (`0001` a `0006`). Son idempotentes. Ver `database/README.md` para el
   detalle de qué hace cada uno.
3. **Authentication → URL Configuration**: agregá `http://localhost:3000` y
   tu dominio de producción a *Redirect URLs*.
4. **Authentication → Providers → Email**: activá "Confirm email" en
   producción.
5. **Authentication → Providers → Google**: creá un OAuth Client ID en
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (tipo "Web application", con el redirect URI que te muestra Supabase en
   este mismo panel) y pegá Client ID + Secret acá.
6. **Authentication → Providers → Apple**: necesitás una cuenta de Apple
   Developer. Creá un *Services ID*, una *Key* con "Sign in with Apple"
   habilitado, y completá Team ID / Key ID / Private Key en este panel.
7. **Project Settings → API**: copiá `URL` y `anon public key` a tu `.env.local`.

## 2. Variables de entorno

Copiá `.env.example` a `.env.local` y completá:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=   # opcional, solo para tareas admin server-side
```

La `service_role key` **nunca** se expone con prefijo `NEXT_PUBLIC_` y nunca
se usa en el navegador.

## 3. Correr localmente

```bash
npm install
npm run dev       # http://localhost:3000
```

Generá los íconos placeholder de la PWA (ya están commiteados, pero podés
regenerarlos):

```bash
npm run icons
```

## 4. Deploy en Vercel

1. Importá el repo en [vercel.com/new](https://vercel.com/new).
2. Framework preset: Next.js (autodetectado).
3. Agregá las mismas variables de entorno de `.env.local` en **Project
   Settings → Environment Variables**, con `NEXT_PUBLIC_SITE_URL` apuntando
   a tu dominio de producción (ej. `https://recetapp.vercel.app`).
4. Deploy. Actualizá las *Redirect URLs* de Supabase con esa misma URL.

## 5. PWA

La app ya es instalable: `public/manifest.json` + `public/sw.js` +
`components/pwa/sw-register.tsx`. En producción, los navegadores mobile van a
ofrecer "Agregar a inicio". El service worker cachea assets estáticos
(cache-first) y páginas HTML (network-first con fallback a `/offline`).

## 6. Capacitor (Android / iOS)

El proyecto está preparado, pero **no se generan los proyectos nativos desde
acá** porque requieren Android Studio / Xcode instalados localmente.

```bash
npm install -g @capacitor/cli   # si no lo tenés global
npm run build                    # o desplegá a Vercel primero
# completá NEXT_PUBLIC_SITE_URL con la URL de producción en capacitor.config.ts
npx cap add android
npx cap add ios
npx cap sync
```

Capacitor envuelve la URL de producción (`capacitor.config.ts → server.url`)
en un WebView nativo — no hace falta un build estático de Next. Queda
preparado para agregar, cuando corresponda: push notifications, cámara,
galería, share sheet, deep links y biometría (`@capacitor/push-notifications`,
`@capacitor/camera`, `@capacitor/share`, etc.), que no se instalaron todavía
para no sumar dependencias innecesarias a la versión web.

## 7. Seguridad

- Row Level Security activado en **todas** las tablas (`database/migrations/0003_rls_policies.sql`).
- Un usuario solo puede editar su perfil, sus recetas, sus publicaciones y
  borrar sus propios comentarios — nunca en nombre de otro.
- Storage (`0004_storage.sql`): lectura pública, escritura restringida a la
  carpeta `{bucket}/{userId}/...` del propio usuario.
- `SUPABASE_SERVICE_ROLE_KEY` nunca se commitea ni se expone al frontend.

## MVP implementado

Autenticación completa (email + Google + Apple + recuperación de contraseña
+ verificación de email) · onboarding de categorías · CRUD de recetas con
ingredientes/pasos dinámicos, fotos, video y notas · conversor de medidas
(volumen↔volumen exacto, volumen↔peso solo con tabla por ingrediente) ·
ajuste de porciones · Modo Cocina · guardar recetas + colecciones · feed
"Para ti"/"Siguiendo" con infinite scroll · publicaciones asociadas a
recetas ("Así les quedó") · likes y comentarios (con respuestas) en recetas y
publicaciones · seguir usuarios · búsqueda de recetas/ingredientes/usuarios/
categorías · "¿Qué puedo cocinar?" · notificaciones · SEO con
`schema.org/Recipe` + Open Graph · estados vacíos y páginas de error · PWA
instalable.
