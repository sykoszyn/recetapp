import { z } from 'zod';

export const recipeIngredientSchema = z.object({
  quantity: z.number().nullable(),
  unit: z.string().nullable(),
  ingredient_id: z.string().uuid().nullable().optional(),
  name_snapshot: z.string().min(1, 'Ingresá el ingrediente'),
  notes: z.string().nullable().optional(),
});

export const recipeStepSchema = z.object({
  title: z.string().nullable().optional(),
  description: z.string().min(1, 'Describí el paso'),
  image_url: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  timer_seconds: z.number().nullable().optional(),
});

export const recipeInfoSchema = z.object({
  title: z.string().min(3, 'Mínimo 3 caracteres').max(120),
  description: z.string().max(500).default(''),
  difficulty: z.enum(['facil', 'media', 'dificil']),
  prep_time_minutes: z.number().min(0).nullable(),
  cook_time_minutes: z.number().min(0).nullable(),
  servings: z.number().min(1).max(50),
  category_ids: z.array(z.string().uuid()).min(1, 'Elegí al menos una categoría'),
});

export const publishRecipeSchema = recipeInfoSchema.extend({
  cover_image_url: z.string().min(1, 'Subí una foto principal'),
  ingredients: z.array(recipeIngredientSchema).min(1, 'Agregá al menos un ingrediente'),
  steps: z.array(recipeStepSchema).min(1, 'Agregá al menos un paso'),
});

export type RecipeIngredientFormValue = z.infer<typeof recipeIngredientSchema>;
export type RecipeStepFormValue = z.infer<typeof recipeStepSchema>;

export const COMMON_UNITS = [
  'gramos',
  'kilogramos',
  'ml',
  'litros',
  'tazas',
  'cucharadas',
  'cucharaditas',
  'unidades',
  'al gusto',
  'pizca',
  'diente(s)',
];
