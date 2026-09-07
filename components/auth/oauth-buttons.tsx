'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.9 10.9 0 0 0 12 1a11 11 0 0 0-9.82 6.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// Apple queda deshabilitado hasta configurar Sign in with Apple (requiere
// cuenta de Apple Developer paga). El botón vuelve a mostrarse activando de
// nuevo el bloque comentado más abajo una vez esté configurado en Supabase.
export function OAuthButtons({ next = '/feed' }: { next?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleGoogle() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <Button type="button" variant="outline" onClick={handleGoogle} disabled={loading} className="w-full gap-2">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
      Continuar con Google
    </Button>
  );
}
