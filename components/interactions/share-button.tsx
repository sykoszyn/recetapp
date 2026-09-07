'use client';

import { Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ShareButton({ url, title, size = 'default' }: { url: string; title: string; size?: 'default' | 'sm' }) {
  const { toast } = useToast();

  async function handleShare() {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: fullUrl });
      } catch {
        // el usuario canceló el share sheet
      }
      return;
    }
    await navigator.clipboard.writeText(fullUrl);
    toast({ description: 'Link copiado al portapapeles.' });
  }

  return (
    <button type="button" onClick={handleShare} aria-label="Compartir" className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Share2 className={size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'} />
    </button>
  );
}
