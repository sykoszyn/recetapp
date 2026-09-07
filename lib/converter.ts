import type { IngredientConversionRow } from '@/types/database';
import { type MeasurementUnit, type VolumeUnit, type WeightUnit, isVolumeUnit, isWeightUnit } from '@/types';

// Tazas/cucharadas en ml usando el estándar métrico (taza = 250ml), el que
// se usa en la mayoría de las recetas en español — no el "US cup" (236.6ml).
const ML_PER_VOLUME_UNIT: Record<VolumeUnit, number> = {
  ml: 1,
  cc: 1,
  l: 1000,
  cup: 250,
  half_cup: 125,
  quarter_cup: 62.5,
  tbsp: 15,
  tsp: 5,
};

const GRAMS_PER_WEIGHT_UNIT: Record<WeightUnit, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

export function toMl(value: number, unit: VolumeUnit): number {
  return value * ML_PER_VOLUME_UNIT[unit];
}

export function fromMl(ml: number, unit: VolumeUnit): number {
  return ml / ML_PER_VOLUME_UNIT[unit];
}

export function toGrams(value: number, unit: WeightUnit): number {
  return value * GRAMS_PER_WEIGHT_UNIT[unit];
}

export function fromGrams(grams: number, unit: WeightUnit): number {
  return grams / GRAMS_PER_WEIGHT_UNIT[unit];
}

/** gramos que pesa 1 ml de este ingrediente, derivado de su taza (250ml) en la tabla curada. */
export function gramsPerMlForIngredient(conversion: IngredientConversionRow): number {
  return conversion.grams_per_cup / 250;
}

export interface ConversionResult {
  value: number;
  approximate: boolean;
}

export type ConversionError = 'needs_ingredient_data';

/**
 * Convierte entre unidades. Volumen↔volumen y peso↔peso son conversiones
 * exactas de sistema métrico. Volumen↔peso SOLO es posible si se provee la
 * densidad específica del ingrediente (nunca se asume 1ml = 1g).
 */
export function convertQuantity(
  value: number,
  fromUnit: MeasurementUnit,
  toUnit: MeasurementUnit,
  ingredientConversion?: IngredientConversionRow | null
): ConversionResult | ConversionError {
  if (fromUnit === toUnit) return { value, approximate: false };

  const fromIsVolume = isVolumeUnit(fromUnit);
  const toIsVolume = isVolumeUnit(toUnit);

  if (fromIsVolume && toIsVolume) {
    const ml = toMl(value, fromUnit);
    // taza/cucharada/cucharadita son medidas caseras, no exactas → aproximado.
    const exactUnits: VolumeUnit[] = ['ml', 'cc', 'l'];
    const approximate = !exactUnits.includes(fromUnit) || !exactUnits.includes(toUnit);
    return { value: fromMl(ml, toUnit), approximate };
  }

  if (!fromIsVolume && !toIsVolume) {
    const grams = toGrams(value, fromUnit as WeightUnit);
    return { value: fromGrams(grams, toUnit as WeightUnit), approximate: false };
  }

  // cruza volumen↔peso: exige densidad específica del ingrediente.
  if (!ingredientConversion) return 'needs_ingredient_data';
  const density = gramsPerMlForIngredient(ingredientConversion); // g/ml

  if (fromIsVolume && !toIsVolume) {
    const ml = toMl(value, fromUnit as VolumeUnit);
    const grams = ml * density;
    return { value: fromGrams(grams, toUnit as WeightUnit), approximate: true };
  }

  const grams = toGrams(value, fromUnit as WeightUnit);
  const ml = grams / density;
  return { value: fromMl(ml, toUnit as VolumeUnit), approximate: true };
}

/** Escala una cantidad al ajustar porciones (ej. de 4 a 8 personas). */
export function scaleQuantity(value: number, fromServings: number, toServings: number): number {
  if (fromServings <= 0) return value;
  return (value * toServings) / fromServings;
}

/** Redondeo amigable para mostrar cantidades (evita 0.3333333333). */
export function formatQuantity(value: number): string {
  if (Number.isNaN(value)) return '—';
  const rounded = Math.round(value * 100) / 100;
  if (Number.isInteger(rounded)) return rounded.toString();

  const commonFractions: [number, string][] = [
    [0.25, '¼'],
    [0.33, '⅓'],
    [0.5, '½'],
    [0.67, '⅔'],
    [0.75, '¾'],
  ];
  const whole = Math.floor(rounded);
  const decimal = rounded - whole;
  const closest = commonFractions.find(([frac]) => Math.abs(decimal - frac) < 0.05);
  if (closest) return whole > 0 ? `${whole} ${closest[1]}` : closest[1];

  return rounded.toFixed(rounded < 10 ? 1 : 0);
}
