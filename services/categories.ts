import type { TypedSupabaseClient } from './types';

export async function listCategories(supabase: TypedSupabaseClient) {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function getUserPreferredCategoryIds(supabase: TypedSupabaseClient, userId: string) {
  const { data, error } = await supabase.from('user_preferences').select('category_id').eq('user_id', userId);
  if (error) throw error;
  return data.map((row) => row.category_id);
}

export async function setUserPreferences(supabase: TypedSupabaseClient, userId: string, categoryIds: string[]) {
  const { error: deleteError } = await supabase.from('user_preferences').delete().eq('user_id', userId);
  if (deleteError) throw deleteError;

  if (categoryIds.length === 0) return;

  const { error: insertError } = await supabase
    .from('user_preferences')
    .insert(categoryIds.map((category_id) => ({ user_id: userId, category_id })));
  if (insertError) throw insertError;

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', userId);
  if (profileError) throw profileError;
}
