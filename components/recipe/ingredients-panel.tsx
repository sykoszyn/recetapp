'use client';

import { useMemo, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { convertQuantity, formatQuantity, scaleQuantity } from '@/lib/converter';
import { isVolumeUnit, isWeightUnit, UNIT_LABELS, VOLUME_UNITS, WEIGHT_UNITS, type MeasurementUnit } from '@/types';
import type { IngredientConversionRow, RecipeIngredientRow } from '@/types/database';

const UNIT_ALIASES: Record<string, MeasurementUnit> = {
  ml: 'ml', mililitros: 'ml', cc: 'cc', litro: 'l', litros: 'l', l: 'l',
  gramo: 'g', gramos: 'g', g: 'g', kilogramo: 'kg', kilogramos: 'kg', kg: 'kg',
  taza: 'cup', tazas: 'cup', 'media taza': 'half_cup', 'cuarto de taza': 'quarter_cup',
  cucharada: 'tbsp', cucharadas: 'tbsp', cucharadita: 'tsp', cucharaditas: 'tsp',
  onza: 'oz', onzas: 'oz', libra: 'lb', libras: 'lb',
};

function detectUnit(unit: string | null): MeasurementUnit | null {
  if (!unit) return null;
  const normalized = UNIT_ALIASES[unit.trim().toLowerCase()];
  return normalized ?? null;
}

function nextUnitFor(unit: MeasurementUnit, hasConversion: boolean): MeasurementUnit {
  const cycle: MeasurementUnit[] = hasConversion ? [...VOLUME_UNITS, ...WEIGHT_UNITS] : isVolumeUnit(unit) ? VOLUME_UNITS : WEIGHT_UNITS;
  const currentIndex = cycle.indexOf(unit);
  return cycle[(currentIndex + 1) % cycle.length];
}

function IngredientLine({
  ingredient,
  servingsRatio,
  conversion,
}: {
  ingredient: RecipeIngredientRow;
  servingsRatio: number;
  conversion?: IngredientConversionRow;
}) {
  const baseUnit = detectUnit(ingredient.unit);
  const [displayUnit, setDisplayUnit] = useState<MeasurementUnit | null>(baseUnit);

  const scaledQuantity = ingredient.quantity !== null ? scaleQuantity(ingredient.quantity, 1, servingsRatio) : null;

  const canConvert = baseUnit !== null && scaledQuantity !== null;
  const result = canConvert && displayUnit ? convertQuantity(scaledQuantity!, baseUnit!, displayUnit, conversion) : null;
  const isApprox = result !== null && typeof result === 'object' && result.approximate;
  const displayValue =
    result !== null && typeof result === 'object'
      ? formatQuantity(result.value)
      : scaledQuantity !== null
        ? formatQuantity(scaledQuantity)
        : null;

  function cycleUnit() {
    if (!baseUnit || !displayUnit) return;
    setDisplayUnit(nextUnitFor(displayUnit, !!conversion));
  }

  return (
    <li className="flex items-center justify-between gap-3 border-b border-border/60 py-3 last:border-none">
      <span className="text-sm">{ingredient.name_snapshot}{ingredient.notes ? <span className="text-muted-foreground"> · {ingredient.notes}</span> : null}</span>
      {displayValue !== null && (
        <button
          type="button"
          onClick={cycleUnit}
          disabled={!baseUnit}
          className="flex flex-shrink-0 items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm font-semibold"
        >
          {isApprox && <span className="text-xs font-normal text-muted-foreground">aprox.</span>}
          {displayValue} {displayUnit ? UNIT_LABELS[displayUnit] : ingredient.unit}
        </button>
      )}
    </li>
  );
}

export function IngredientsPanel({
  ingredients,
  originalServings,
  conversions,
}: {
  ingredients: RecipeIngredientRow[];
  originalServings: number;
  conversions: Record<string, IngredientConversionRow>;
}) {
  const [servings, setServings] = useState(originalServings);
  const ratio = useMemo(() => servings / originalServings, [servings, originalServings]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Ingredientes</h2>
        <div className="flex items-center gap-3 rounded-full border border-border px-1.5 py-1">
          <button
            type="button"
            aria-label="Menos porciones"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-14 text-center text-sm font-semibold">{servings} porciones</span>
          <button
            type="button"
            aria-label="Más porciones"
            onClick={() => setServings((s) => Math.min(50, s + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-muted"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <ul>
        {ingredients.map((ingredient) => (
          <IngredientLine
            key={ingredient.id}
            ingredient={ingredient}
            servingsRatio={ratio}
            conversion={ingredient.ingredient_id ? conversions[ingredient.ingredient_id] : undefined}
          />
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">Tocá una cantidad para cambiar de unidad. Las conversiones caseras son aproximadas.</p>
    </div>
  );
}
