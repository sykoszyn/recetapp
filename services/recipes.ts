import { slugify } from '@/lib/utils';
import type { RecipeCardData, RecipeDetail } from '@/types';
import type { RecipeIngredientMatch } from '@/types/database';
import type { TypedSupabaseClient } from './types';

const RECIPE_CARD_SELECT = `
  *,
  author:profiles!recipes_user_id_fkey(id, username, full_name, avatar_url),
  categories:recipe_categories(category:categories(id, name, slug, emoji))
`;

function normalizeCardRow(row: any): RecipeCardData {
  return {
    ...row,
    categories: (row.categories ?? []).map((rc: any) => rc.category).filter(Boolean),
  };
}

export async function generateUniqueRecipeSlug(supabase: TypedSupabaseClient, title: string) {
  const base = slugify(title) || 'receta';
  let candidate = base;
  let suffix = 0;
  while (true) {
    const { data } = await supabase.from('recipes').select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

export interface RecipeIngredientInput {
  quantity: number | null;
  unit: string | null;
  ingredient_id?: string | null;
  name_snapshot: string;
  notes?: string | null;
}

export interface RecipeStepInput {
  title?: string | null;
  description: string;
  image_url?: string | null;
  video_url?: string | null;
  timer_seconds?: number | null;
}

export interface RecipeMediaInput {
  media_type: 'image' | 'video';
  url: string;
  thumbnail_url?: string | null;
}

export interface UpsertRecipeInput {
  title: string;
  description: string;
  cover_image_url: string | null;
  video_url?: string | null;
  video_thumbnail_url?: string | null;
  difficulty: 'facil' | 'media' | 'dificil';
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number;
  notes: string;
  status: 'draft' | 'published';
  category_ids: string[];
  tags: string[];
  ingredients: RecipeIngredientInput[];
  steps: RecipeStepInput[];
  media: RecipeMediaInput[];
}

export async function createRecipe(supabase: TypedSupabaseClient, userId: string, input: UpsertRecipeInput) {
  const slug = await generateUniqueRecipeSlug(supabase, input.title);

  const { data: recipe, error } = await supabase
    .from('recipes')
    .insert({
      user_id: userId,
      title: input.title,
      slug,
      description: input.description,
      cover_image_url: input.cover_image_url,
      video_url: input.video_url ?? null,
      video_thumbnail_url: input.video_thumbnail_url ?? null,
      difficulty: input.difficulty,
      prep_time_minutes: input.prep_time_minutes,
      cook_time_minutes: input.cook_time_minutes,
      servings: input.servings,
      notes: input.notes,
      status: input.status,
      published_at: input.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();
  if (error) throw error;

  await writeRecipeChildren(supabase, recipe.id, input);
  return recipe;
}

export async function updateRecipe(supabase: TypedSupabaseClient, recipeId: string, input: UpsertRecipeInput) {
  const { data: current } = await supabase.from('recipes').select('status, published_at').eq('id', recipeId).single();

  const { data: recipe, error } = await supabase
    .from('recipes')
    .update({
      title: input.title,
      description: input.description,
      cover_image_url: input.cover_image_url,
      video_url: input.video_url ?? null,
      video_thumbnail_url: input.video_thumbnail_url ?? null,
      difficulty: input.difficulty,
      prep_time_minutes: input.prep_time_minutes,
      cook_time_minutes: input.cook_time_minutes,
      servings: input.servings,
      notes: input.notes,
      status: input.status,
      published_at: current?.published_at ?? (input.status === 'published' ? new Date().toISOString() : null),
    })
    .eq('id', recipeId)
    .select()
    .single();
  if (error) throw error;

  await Promise.all([
    supabase.from('recipe_categories').delete().eq('recipe_id', recipeId),
    supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId),
    supabase.from('recipe_steps').delete().eq('recipe_id', recipeId),
    supabase.from('recipe_media').delete().eq('recipe_id', recipeId),
    supabase.from('recipe_tags').delete().eq('recipe_id', recipeId),
  ]);
  await writeRecipeChildren(supabase, recipeId, input);
  return recipe;
}

async function writeRecipeChildren(supabase: TypedSupabaseClient, recipeId: string, input: UpsertRecipeInput) {
  if (input.category_ids.length) {
    const { error } = await supabase
      .from('recipe_categories')
      .insert(input.category_ids.map((category_id) => ({ recipe_id: recipeId, category_id })));
    if (error) throw error;
  }

  if (input.ingredients.length) {
    const { error } = await supabase.from('recipe_ingredients').insert(
      input.ingredients.map((ingredient, index) => ({ recipe_id: recipeId, position: index, ...ingredient }))
    );
    if (error) throw error;
  }

  if (input.steps.length) {
    const { error } = await supabase
      .from('recipe_steps')
      .insert(input.steps.map((step, index) => ({ recipe_id: recipeId, position: index, ...step })));
    if (error) throw error;
  }

  if (input.media.length) {
    const { error } = await supabase
      .from('recipe_media')
      .insert(input.media.map((media, index) => ({ recipe_id: recipeId, position: index, ...media })));
    if (error) throw error;
  }

  if (input.tags.length) {
    const { error } = await supabase
      .from('recipe_tags')
      .insert(input.tags.map((tag) => ({ recipe_id: recipeId, tag })));
    if (error) throw error;
  }
}

export async function deleteRecipe(supabase: TypedSupabaseClient, recipeId: string) {
  const { error } = await supabase.from('recipes').delete().eq('id', recipeId);
  if (error) throw error;
}

export async function getRecipeBySlug(
  supabase: TypedSupabaseClient,
  slug: string,
  viewerId?: string | null
): Promise<RecipeDetail | null> {
  const { data: recipe, error } = await supabase.from('recipes').select(RECIPE_CARD_SELECT).eq('slug', slug).maybeSingle();
  if (error) throw error;
  if (!recipe) return null;

  const [{ data: ingredients }, { data: steps }, { data: media }, { data: tags }, likedResult, savedResult] = await Promise.all([
    supabase.from('recipe_ingredients').select('*').eq('recipe_id', recipe.id).order('position'),
    supabase.from('recipe_steps').select('*').eq('recipe_id', recipe.id).order('position'),
    supabase.from('recipe_media').select('*').eq('recipe_id', recipe.id).order('position'),
    supabase.from('recipe_tags').select('tag').eq('recipe_id', recipe.id),
    viewerId
      ? supabase.from('recipe_likes').select('user_id').eq('recipe_id', recipe.id).eq('user_id', viewerId).maybeSingle()
      : Promise.resolve({ data: null }),
    viewerId
      ? supabase.from('saved_recipes').select('user_id').eq('recipe_id', recipe.id).eq('user_id', viewerId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    ...normalizeCardRow(recipe),
    ingredients: ingredients ?? [],
    steps: steps ?? [],
    media: media ?? [],
    tags: (tags ?? []).map((t) => t.tag),
    is_liked: !!likedResult.data,
    is_saved: !!savedResult.data,
  };
}

export async function incrementRecipeView(supabase: TypedSupabaseClient, recipeId: string, viewerId?: string | null) {
  await supabase.from('recipe_views').insert({ recipe_id: recipeId, user_id: viewerId ?? null });
}

export async function listPublishedRecipes(
  supabase: TypedSupabaseClient,
  options: { categorySlug?: string; limit?: number; offset?: number; orderBy?: 'recent' | 'popular' } = {}
) {
  const { categorySlug, limit = 20, offset = 0, orderBy = 'recent' } = options;

  let query = supabase.from('recipes').select(RECIPE_CARD_SELECT).eq('status', 'published');

  if (categorySlug) {
    const { data: category } = await supabase.from('categories').select('id').eq('slug', categorySlug).maybeSingle();
    if (category) {
      const { data: recipeIds } = await supabase.from('recipe_categories').select('recipe_id').eq('category_id', category.id);
      query = query.in('id', (recipeIds ?? []).map((r) => r.recipe_id));
    }
  }

  query =
    orderBy === 'popular'
      ? query.order('likes_count', { ascending: false })
      : query.order('published_at', { ascending: false });

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw error;
  return (data ?? []).map(normalizeCardRow);
}

export async function searchRecipes(supabase: TypedSupabaseClient, term: string, limit = 20) {
  const { data, error } = await supabase
    .from('recipes')
    .select(RECIPE_CARD_SELECT)
    .eq('status', 'published')
    .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
    .order('likes_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizeCardRow);
}

export async function getUserRecipes(supabase: TypedSupabaseClient, userId: string, status?: 'draft' | 'published') {
  let query = supabase.from('recipes').select(RECIPE_CARD_SELECT).eq('user_id', userId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeCardRow);
}

export async function toggleRecipeLike(supabase: TypedSupabaseClient, userId: string, recipeId: string, like: boolean) {
  if (like) {
    const { error } = await supabase.from('recipe_likes').insert({ user_id: userId, recipe_id: recipeId });
    if (error && error.code !== '23505') throw error;
  } else {
    const { error } = await supabase.from('recipe_likes').delete().eq('user_id', userId).eq('recipe_id', recipeId);
    if (error) throw error;
  }
}

export async function toggleSaveRecipe(supabase: TypedSupabaseClient, userId: string, recipeId: string, save: boolean) {
  if (save) {
    const { error } = await supabase.from('saved_recipes').insert({ user_id: userId, recipe_id: recipeId });
    if (error && error.code !== '23505') throw error;
  } else {
    const { error } = await supabase.from('saved_recipes').delete().eq('user_id', userId).eq('recipe_id', recipeId);
    if (error) throw error;
  }
}

export async function getSimilarRecipes(supabase: TypedSupabaseClient, recipeId: string, categoryIds: string[], limit = 8) {
  if (!categoryIds.length) return [];
  const { data: linkedIds } = await supabase.from('recipe_categories').select('recipe_id').in('category_id', categoryIds);
  const candidateIds = Array.from(new Set((linkedIds ?? []).map((r) => r.recipe_id))).filter((id) => id !== recipeId);
  if (!candidateIds.length) return [];

  const { data, error } = await supabase
    .from('recipes')
    .select(RECIPE_CARD_SELECT)
    .eq('status', 'published')
    .in('id', candidateIds)
    .order('likes_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(normalizeCardRow);
}

export interface IngredientMatchResult {
  recipe: RecipeCardData;
  missing_ingredients: number;
  matched_ingredients: number;
  total_ingredients: number;
}

export async function findRecipesByIngredients(
  supabase: TypedSupabaseClient,
  ingredientNames: string[],
  maxMissing = 2
): Promise<IngredientMatchResult[]> {
  if (!ingredientNames.length) return [];

  const { data, error } = await supabase.rpc('recipes_matching_ingredients', {
    p_ingredient_names: ingredientNames,
    p_max_missing: maxMissing,
    p_limit: 30,
  });
  if (error) throw error;
  const matches = (data ?? []) as RecipeIngredientMatch[];
  if (!matches.length) return [];

  const { data: recipesData, error: recipesError } = await supabase
    .from('recipes')
    .select(RECIPE_CARD_SELECT)
    .in('id', matches.map((m) => m.recipe_id));
  if (recipesError) throw recipesError;

  const recipeById = new Map((recipesData ?? []).map((r: any) => [r.id, normalizeCardRow(r)]));
  return matches
    .map((m) => {
      const recipe = recipeById.get(m.recipe_id);
      if (!recipe) return null;
      return {
        recipe,
        missing_ingredients: Number(m.missing_ingredients),
        matched_ingredients: Number(m.matched_ingredients),
        total_ingredients: Number(m.total_ingredients),
      };
    })
    .filter((r): r is IngredientMatchResult => r !== null);
}
