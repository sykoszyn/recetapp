import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getRecipeBySlug } from '@/services/recipes';
import { listCategories } from '@/services/categories';
import { RecipeWizard, type RecipeWizardState } from '@/components/create-recipe/recipe-wizard';

export default async function EditRecipePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [recipe, categories] = await Promise.all([getRecipeBySlug(supabase, params.slug, user.id), listCategories(supabase)]);
  if (!recipe) notFound();
  if (recipe.user_id !== user.id) redirect(`/recipe/${params.slug}`);

  const initialState: RecipeWizardState = {
    title: recipe.title,
    description: recipe.description,
    difficulty: recipe.difficulty,
    prep_time_minutes: recipe.prep_time_minutes,
    cook_time_minutes: recipe.cook_time_minutes,
    servings: recipe.servings,
    category_ids: recipe.categories.map((c) => c.id),
    cover_image_url: recipe.cover_image_url,
    video_url: recipe.video_url,
    media: recipe.media.map((m) => ({ media_type: m.media_type, url: m.url })),
    ingredients: recipe.ingredients.map((i) => ({
      quantity: i.quantity,
      unit: i.unit,
      ingredient_id: i.ingredient_id,
      name_snapshot: i.name_snapshot,
      notes: i.notes,
    })),
    steps: recipe.steps.map((s) => ({
      title: s.title,
      description: s.description,
      image_url: s.image_url,
      video_url: s.video_url,
      timer_seconds: s.timer_seconds,
    })),
    notes: recipe.notes,
    tags: recipe.tags,
  };

  return <RecipeWizard userId={user.id} categories={categories} initialState={initialState} recipeId={recipe.id} />;
}
