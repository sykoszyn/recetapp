import type { TypedSupabaseClient } from './types';

const RECIPE_CARD_SELECT = `
  *,
  author:profiles!recipes_user_id_fkey(id, username, full_name, avatar_url),
  categories:recipe_categories(category:categories(id, name, slug, emoji))
`;

function normalizeCardRow(row: any) {
  return { ...row, categories: (row.categories ?? []).map((rc: any) => rc.category).filter(Boolean) };
}

export async function searchAll(supabase: TypedSupabaseClient, term: string) {
  const trimmed = term.trim();
  if (trimmed.length < 2) return { recipes: [], users: [], categories: [] };

  const [byTextResult, byIngredientIds, usersResult, categoriesResult] = await Promise.all([
    supabase.from('recipes').select(RECIPE_CARD_SELECT).eq('status', 'published').or(`title.ilike.%${trimmed}%,description.ilike.%${trimmed}%`).limit(20),
    supabase.from('recipe_ingredients').select('recipe_id').ilike('name_snapshot', `%${trimmed}%`).limit(50),
    supabase.from('profiles').select('id, username, full_name, avatar_url, followers_count').or(`username.ilike.%${trimmed}%,full_name.ilike.%${trimmed}%`).order('followers_count', { ascending: false }).limit(10),
    supabase.from('categories').select('*').ilike('name', `%${trimmed}%`).limit(5),
  ]);

  const ingredientRecipeIds = Array.from(new Set((byIngredientIds.data ?? []).map((r) => r.recipe_id)));
  let byIngredientRecipes: any[] = [];
  if (ingredientRecipeIds.length) {
    const { data } = await supabase.from('recipes').select(RECIPE_CARD_SELECT).eq('status', 'published').in('id', ingredientRecipeIds).limit(20);
    byIngredientRecipes = data ?? [];
  }

  const recipesById = new Map<string, any>();
  [...(byTextResult.data ?? []), ...byIngredientRecipes].forEach((r) => recipesById.set(r.id, r));

  return {
    recipes: Array.from(recipesById.values()).map(normalizeCardRow),
    users: usersResult.data ?? [],
    categories: categoriesResult.data ?? [],
  };
}
