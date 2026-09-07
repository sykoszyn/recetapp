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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)'],
};
