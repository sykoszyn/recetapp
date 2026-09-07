'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ChevronLeft, ChevronRight, ListChecks, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StepTimer } from './step-timer';
import type { RecipeIngredientRow, RecipeStepRow } from '@/types/database';

export function CookModeView({
  title,
  slug,
  recipeId,
  ingredients,
  steps,
}: {
  title: string;
  slug: string;
  recipeId: string;
  ingredients: RecipeIngredientRow[];
  steps: RecipeStepRow[];
}) {
  const router = useRouter();
  const [showIngredients, setShowIngredients] = useState(true);
  const [current, setCurrent] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const step = steps[current];
  const progress = ((current + 1) / steps.length) * 100;

  function toggleCompleted(index: number) {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  if (showIngredients) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background safe-top safe-bottom">
        <header className="flex items-center justify-between border-b border-border p-4">
          <h1 className="text-lg font-bold">{title}</h1>
          <button onClick={() => router.push(`/recipe/${slug}`)} aria-label="Cerrar modo cocina">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">Antes de empezar, revisá los ingredientes:</p>
          <ul className="space-y-2">
            {ingredients.map((ingredient) => (
              <li key={ingredient.id} className="rounded-xl border border-border p-3 text-sm">
                {[ingredient.quantity, ingredient.unit, ingredient.name_snapshot].filter(Boolean).join(' ')}
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-border p-4">
          <Button className="w-full" size="lg" onClick={() => setShowIngredients(false)}>
            Empezar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background safe-top safe-bottom">
      <header className="flex items-center gap-3 border-b border-border p-4">
        <button onClick={() => router.push(`/recipe/${slug}`)} aria-label="Cerrar modo cocina">
          <X className="h-5 w-5" />
        </button>
        <div className="h-1.5 flex-1 rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
        <button onClick={() => setShowIngredients(true)} aria-label="Ver ingredientes">
          <ListChecks className="h-5 w-5" />
        </button>
      </header>

      <div className="flex flex-1 flex-col justify-center px-6 py-8">
        <span className="mb-2 text-sm font-semibold text-primary">
          Paso {current + 1} de {steps.length}
        </span>
        {step.title && <h2 className="mb-3 text-2xl font-bold">{step.title}</h2>}
        <p className="text-xl leading-relaxed">{step.description}</p>

        {step.timer_seconds && (
          <div className="mt-6">
            <StepTimer seconds={step.timer_seconds} />
          </div>
        )}

        <button
          type="button"
          onClick={() => toggleCompleted(current)}
          className={cn(
            'mt-8 flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold',
            completed.has(current) ? 'border-success bg-success/10 text-success' : 'border-border text-muted-foreground'
          )}
        >
          <Check className="h-4 w-4" /> {completed.has(current) ? 'Paso completado' : 'Marcar como completado'}
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-border p-4">
        <Button variant="outline" size="lg" className="flex-1 gap-2" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          <ChevronLeft className="h-5 w-5" /> Anterior
        </Button>
        {current === steps.length - 1 ? (
          <Button size="lg" className="flex-1" asChild>
            <Link href={`/create/post?recipe=${recipeId}`}>Terminé 🎉</Link>
          </Button>
        ) : (
          <Button size="lg" className="flex-1 gap-2" onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}>
            Siguiente <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
