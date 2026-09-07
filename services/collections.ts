import type { TypedSupabaseClient } from './types';

const RECIPE_CARD_SELECT = `
  *,
  author:profiles!recipes_user_id_fkey(id, username, full_name, avatar_url),
  categories:recipe_categories(category:categories(id, name, slug, emoji))
`;

function normalizeCardRow(row: any) {
  return { ...row, categories: (row.categories ?? []).map((rc: any) => rc.category).filter(Boolean) };
}

export async function ensureDefaultCollection(supabase: TypedSupabaseClient, userId: string) {
  const { data: existing } = await supabase.from('collections').select('id').eq('user_id', userId).eq('is_default', true).maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from('collections')
    .insert({ user_id: userId, name: 'Favoritas', is_default: true })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function listCollections(supabase: TypedSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('collections')
    .select('*, collection_recipes(count)')
    .eq('user_id', userId)
    .order('created_at');
  if (error) throw error;
  return data;
}

export async function createCollection(supabase: TypedSupabaseClient, userId: string, name: string) {
  const { data, error } = await supabase.from('collections').insert({ user_id: userId, name }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteCollection(supabase: TypedSupabaseClient, collectionId: string) {
  const { error } = await supabase.from('collections').delete().eq('id', collectionId);
  if (error) throw error;
}

export async function addRecipeToCollection(supabase: TypedSupabaseClient, collectionId: string, recipeId: string) {
  const { error } = await supabase.from('collection_recipes').insert({ collection_id: collectionId, recipe_id: recipeId });
  if (error && error.code !== '23505') throw error;
}

export async function removeRecipeFromCollection(supabase: TypedSupabaseClient, collectionId: string, recipeId: string) {
  const { error } = await supabase.from('collection_recipes').delete().eq('collection_id', collectionId).eq('recipe_id', recipeId);
  if (error) throw error;
}

export async function getCollectionsForRecipe(supabase: TypedSupabaseClient, userId: string, recipeId: string) {
  const { data, error } = await supabase
    .from('collection_recipes')
    .select('collection_id')
    .eq('recipe_id', recipeId)
    .in('collection_id', (await supabase.from('collections').select('id').eq('user_id', userId)).data?.map((c) => c.id) ?? []);
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.collection_id));
}

export async function listSavedRecipes(supabase: TypedSupabaseClient, userId: string, collectionId?: string) {
  if (collectionId) {
    const { data, error } = await supabase
      .from('collection_recipes')
      .select(`recipe:recipes(${RECIPE_CARD_SELECT})`)
      .eq('collection_id', collectionId)
      .order('added_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => normalizeCardRow(row.recipe));
  }

  const { data, error } = await supabase
    .from('saved_recipes')
    .select(`recipe:recipes(${RECIPE_CARD_SELECT})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => normalizeCardRow(row.recipe));
}
