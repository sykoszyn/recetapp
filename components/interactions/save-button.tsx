'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleSaveRecipeAction } from '@/features/interactions/actions';

export function SaveButton({
  recipeId,
  initialSaved,
  isAuthenticated,
  showLabel = false,
  size = 'default',
}: {
  recipeId: string;
  initialSaved: boolean;
  isAuthenticated: boolean;
  showLabel?: boolean;
  size?: 'default' | 'sm';
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);

  async function handleClick() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    const next = !saved;
    setSaved(next);
    try {
      await toggleSaveRecipeAction(recipeId, next);
    } catch {
      setSaved(!next);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Quitar de guardados' : 'Guardar receta'}
      className="flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <Bookmark className={cn(size === 'sm' ? 'h-5 w-5' : 'h-6 w-6', saved && 'fill-primary text-primary')} />
      {showLabel && <span className="font-medium">{saved ? 'Guardada' : 'Guardar'}</span>}
    </button>
  );
}
