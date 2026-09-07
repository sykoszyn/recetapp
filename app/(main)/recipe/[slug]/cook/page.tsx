import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRecipeBySlug } from '@/services/recipes';
import { CookModeView } from '@/components/cook-mode/cook-mode-view';

export default async function CookModePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const recipe = await getRecipeBySlug(supabase, params.slug, user?.id ?? null);
  if (!recipe) notFound();

  return <CookModeView title={recipe.title} slug={recipe.slug} recipeId={recipe.id} ingredients={recipe.ingredients} steps={recipe.steps} />;
}
