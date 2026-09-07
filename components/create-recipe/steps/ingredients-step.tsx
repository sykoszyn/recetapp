'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { COMMON_UNITS } from '@/features/recipes/schema';
import type { RecipeWizardState } from '../recipe-wizard';

export function IngredientsStep({
  state,
  update,
}: {
  state: RecipeWizardState;
  update: (patch: Partial<RecipeWizardState>) => void;
}) {
  const [suggestions, setSuggestions] = useState<Record<number, { id: string; name: string }[]>>({});

  function addRow() {
    update({ ingredients: [...state.ingredients, { quantity: null, unit: '', ingredient_id: null, name_snapshot: '', notes: '' }] });
  }

  function updateRow(index: number, patch: Partial<(typeof state.ingredients)[number]>) {
    const next = state.ingredients.map((row, i) => (i === index ? { ...row, ...patch } : row));
    update({ ingredients: next });
  }

  function removeRow(index: number) {
    update({ ingredients: state.ingredients.filter((_, i) => i !== index) });
  }

  async function handleNameChange(index: number, value: string) {
    updateRow(index, { name_snapshot: value, ingredient_id: null });
    if (value.trim().length < 2) {
      setSuggestions((prev) => ({ ...prev, [index]: [] }));
      return;
    }
    const res = await fetch(`/api/ingredients/search?q=${encodeURIComponent(value)}`);
    const data = await res.json();
    setSuggestions((prev) => ({ ...prev, [index]: data.items ?? [] }));
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Agregá cantidad, unidad e ingrediente. Vinculá con la lista para que el conversor de medidas funcione mejor.
      </p>

      {state.ingredients.map((row, index) => (
        <div key={index} className="rounded-xl border border-border p-3">
          <div className="grid grid-cols-[4.5rem_6.5rem_1fr_auto] gap-2">
            <Input
              type="number"
              placeholder="500"
              value={row.quantity ?? ''}
              onChange={(e) => updateRow(index, { quantity: e.target.value ? Number(e.target.value) : null })}
            />
            <Input
              list={`units-${index}`}
              placeholder="gramos"
              value={row.unit ?? ''}
              onChange={(e) => updateRow(index, { unit: e.target.value })}
            />
            <datalist id={`units-${index}`}>
              {COMMON_UNITS.map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
            <div className="relative">
              <Input
                placeholder="Harina"
                value={row.name_snapshot}
                onChange={(e) => handleNameChange(index, e.target.value)}
              />
              {!!suggestions[index]?.length && (
                <ul className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-popover shadow-card">
                  {suggestions[index].map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          updateRow(index, { name_snapshot: s.name, ingredient_id: s.id });
                          setSuggestions((prev) => ({ ...prev, [index]: [] }));
                        }}
                      >
                        {s.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeRow(index)} aria-label="Eliminar ingrediente">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addRow} className="w-full gap-2">
        <Plus className="h-4 w-4" /> Agregar ingrediente
      </Button>
    </div>
  );
}
