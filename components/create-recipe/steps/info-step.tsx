'use client';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CategoryRow } from '@/types/database';
import type { RecipeWizardState } from '../recipe-wizard';

const DIFFICULTIES: { value: RecipeWizardState['difficulty']; label: string }[] = [
  { value: 'facil', label: 'Fácil' },
  { value: 'media', label: 'Media' },
  { value: 'dificil', label: 'Difícil' },
];

export function InfoStep({
  state,
  update,
  categories,
}: {
  state: RecipeWizardState;
  update: (patch: Partial<RecipeWizardState>) => void;
  categories: CategoryRow[];
}) {
  function toggleCategory(id: string) {
    const set = new Set(state.category_ids);
    set.has(id) ? set.delete(id) : set.add(id);
    update({ category_ids: Array.from(set) });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Título</Label>
        <Input id="title" value={state.title} onChange={(e) => update({ title: e.target.value })} placeholder="Cookies estilo New York" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={state.description}
          onChange={(e) => update({ description: e.target.value })}
          placeholder="Contá de qué se trata esta receta..."
          maxLength={500}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Dificultad</Label>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => update({ difficulty: d.value })}
              className={cn(
                'flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                state.difficulty === d.value ? 'border-primary bg-primary/10 text-primary' : 'border-border'
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="prep">Prep. (min)</Label>
          <Input
            id="prep"
            type="number"
            min={0}
            value={state.prep_time_minutes ?? ''}
            onChange={(e) => update({ prep_time_minutes: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cook">Cocción (min)</Label>
          <Input
            id="cook"
            type="number"
            min={0}
            value={state.cook_time_minutes ?? ''}
            onChange={(e) => update({ cook_time_minutes: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="servings">Porciones</Label>
          <Input
            id="servings"
            type="number"
            min={1}
            value={state.servings}
            onChange={(e) => update({ servings: Number(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Categorías</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const isSelected = state.category_ids.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                )}
              >
                {category.emoji} {category.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
