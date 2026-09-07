'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createRecipe, deleteRecipe, updateRecipe, type UpsertRecipeInput } from '@/services/recipes';
import { publishRecipeSchema } from './schema';

export interface RecipeActionResult {
  error?: string;
  slug?: string;
}

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
  return { supabase, userId: user.id };
}

export async function saveRecipeAction(
  input: UpsertRecipeInput,
  existingRecipeId?: string
): Promise<RecipeActionResult> {
  const { supabase, userId } = await requireUser();

  if (input.status === 'published') {
    const parsed = publishRecipeSchema.safeParse(input);
    if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Revisá los datos de la receta.' };
  } else if (!input.title?.trim()) {
    return { error: 'Ingresá al menos un título para guardar el borrador.' };
  }

  const recipe = existingRecipeId
    ? await updateRecipe(supabase, existingRecipeId, input)
    : await createRecipe(supabase, userId, input);

  revalidatePath(`/recipe/${recipe.slug}`);
  revalidatePath('/feed');
  return { slug: recipe.slug };
}

export async function deleteRecipeAction(recipeId: string) {
  const { supabase } = await requireUser();
  await deleteRecipe(supabase, recipeId);
  revalidatePath('/feed');
  redirect('/feed');
}
