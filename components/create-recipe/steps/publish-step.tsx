'use client';

import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RecipeCover } from '@/components/recipe/recipe-cover';
import type { RecipeWizardState } from '../recipe-wizard';

export function PublishStep({
  state,
  update,
}: {
  state: RecipeWizardState;
  update: (patch: Partial<RecipeWizardState>) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
        <RecipeCover src={state.cover_image_url} alt={state.title} seed={state.title || 'receta'} className="h-16 w-16 flex-shrink-0 rounded-xl" />
        <div>
          <p className="font-semibold leading-tight">{state.title || 'Sin título'}</p>
          <p className="text-sm text-muted-foreground">
            {state.ingredients.length} ingredientes · {state.steps.length} pasos
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Consejos / notas adicionales</Label>
        <Textarea
          id="notes"
          value={state.notes}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder="Tips, sustituciones, cómo conservarla..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
        <Input
          id="tags"
          value={state.tags.join(', ')}
          onChange={(e) => update({ tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
          placeholder="rápido, sin horno, económico"
        />
      </div>
    </div>
  );
}
