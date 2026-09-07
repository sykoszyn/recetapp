import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    // El middleware nunca debe tirar 500 a todo el sitio: cada página
    // protegida ya vuelve a chequear la sesión del lado del servidor y
    // redirige a /login si no hay usuario, así que ante un error inesperado
    // acá (red, límite de Edge, etc.) es más seguro dejar pasar el request
    // que romper la app entera. Se loguea para poder diagnosticarlo.
    console.error('[middleware] updateSession failed:', error);
    return NextResponse.next({ request });
  }
}

// Solo corre donde hace falta: rutas protegidas (para redirigir a /login) y
// rutas de auth (para redirigir a /feed si ya hay sesión). El resto —
// landing, /explore, /recipe/*, /user/*, /post/*, /api/*, assets — es
// público o ya se protege solo en el propio Server Component/Server Action,
// así que correr el middleware ahí solo agrega una llamada de red de más
// (auth.getUser() contra Supabase) en cada navegación sin ganar nada.
export const config = {
  matcher: [
    '/feed/:path*',
    '/create/:path*',
    '/saved/:path*',
    '/notifications/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ],
};
