'use client';

import { useState } from 'react';
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

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M16.36 1.43c.1 1.05-.3 2.06-.98 2.83-.7.78-1.75 1.36-2.8 1.28-.12-1.03.35-2.1 1-2.83.72-.8 1.87-1.4 2.78-1.28zM20.1 17.4c-.3.7-.66 1.36-1.1 1.98-.6.85-1.22 1.7-2.2 1.72-.96.02-1.28-.6-2.4-.6-1.11 0-1.46.58-2.38.62-.94.04-1.65-.88-2.26-1.72-1.24-1.75-2.2-4.94-.9-7.1.63-1.05 1.77-1.72 2.98-1.74.94-.02 1.6.62 2.4.62.8 0 1.32-.62 2.42-.6.87.02 1.87.5 2.5 1.36-2.2 1.34-1.86 4.4.94 5.46z" />
    </svg>
  );
}

export function OAuthButtons({ next = '/feed' }: { next?: string }) {
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  async function handleOAuth(provider: 'google' | 'apple') {
    setLoading(provider);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuth('google')}
        disabled={loading !== null}
        className="gap-2"
      >
        <GoogleIcon /> Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOAuth('apple')}
        disabled={loading !== null}
        className="gap-2"
      >
        <AppleIcon /> Apple
      </Button>
    </div>
  );
}
