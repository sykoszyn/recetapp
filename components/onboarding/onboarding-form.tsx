'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { completeOnboardingAction } from '@/features/onboarding/actions';
import type { CategoryRow } from '@/types/database';

const MIN_SELECTION = 3;

export function OnboardingForm({ categories }: { categories: CategoryRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleContinue() {
    startTransition(() => {
      completeOnboardingAction(Array.from(selected));
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 pb-28 pt-8 safe-top">
      <h1 className="text-2xl font-bold tracking-tight">¿Qué te gusta cocinar?</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Elegí al menos {MIN_SELECTION} temas para personalizar tu feed. Podés cambiarlo después.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selected.has(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggle(category.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-sm font-medium transition-all active:scale-95',
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-soft'
                  : 'border-border bg-card text-foreground hover:border-primary/40'
              )}
            >
              <span>{category.emoji}</span>
              {category.name}
            </button>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur safe-bottom">
        <div className="mx-auto max-w-lg">
          <Button className="w-full" size="lg" disabled={selected.size < MIN_SELECTION || isPending} onClick={handleContinue}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Continuar ({selected.size}/{MIN_SELECTION})
          </Button>
        </div>
      </div>
    </div>
  );
}
