// Tipos manuales que reflejan database/migrations/*.sql. Si el schema
// cambia, actualizar acá (o generar con `supabase gen types typescript`
// una vez que el proyecto esté linkeado).

export type DifficultyLevel = 'facil' | 'media' | 'dificil';
export type RecipeStatus = 'draft' | 'published';
export type MediaType = 'image' | 'video';
export type DifficultyFeedback = 'muy_facil' | 'facil' | 'normal' | 'dificil';
export type NotificationType =
  | 'like_post'
  | 'like_recipe'
  | 'follow'
  | 'comment_recipe'
  | 'comment_post'
  | 'reply_comment'
  | 'recipe_cooked'
  | 'milestone_saves';

export interface ProfileRow {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  website: string | null;
  followers_count: number;
  following_count: number;
  recipes_count: number;
  posts_count: number;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  created_at: string;
}

export interface UserPreferenceRow {
  user_id: string;
  category_id: string;
  created_at: string;
}

export interface IngredientRow {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface IngredientConversionRow {
  ingredient_id: string;
  grams_per_cup: number;
  grams_per_tablespoon: number;
  grams_per_teaspoon: number;
  notes: string | null;
  updated_at: string;
}

export interface RecipeRow {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  video_url: string | null;
  video_thumbnail_url: string | null;
  difficulty: DifficultyLevel;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number;
  notes: string;
  status: RecipeStatus;
  calories_per_serving: number | null;
  protein_grams: number | null;
  carbs_grams: number | null;
  fat_grams: number | null;
  likes_count: number;
  saves_count: number;
  comments_count: number;
  views_count: number;
  cooked_count: number;
  rating_avg: number;
  rating_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeCategoryRow {
  recipe_id: string;
  category_id: string;
}

export interface RecipeIngredientRow {
  id: string;
  recipe_id: string;
  position: number;
  quantity: number | null;
  unit: string | null;
  ingredient_id: string | null;
  name_snapshot: string;
  notes: string | null;
}

export interface RecipeStepRow {
  id: string;
  recipe_id: string;
  position: number;
  title: string | null;
  description: string;
  image_url: string | null;
  video_url: string | null;
  timer_seconds: number | null;
}

export interface RecipeMediaRow {
  id: string;
  recipe_id: string;
  media_type: MediaType;
  url: string;
  thumbnail_url: string | null;
  position: number;
}

export interface RecipeTagRow {
  recipe_id: string;
  tag: string;
}

export interface RecipeViewRow {
  id: number;
  recipe_id: string;
  user_id: string | null;
  viewed_at: string;
}

export interface PostRow {
  id: string;
  user_id: string;
  caption: string;
  rating: number | null;
  difficulty_feedback: DifficultyFeedback | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostMediaRow {
  id: string;
  post_id: string;
  media_type: MediaType;
  url: string;
  thumbnail_url: string | null;
  position: number;
}

export interface PostRecipeLinkRow {
  post_id: string;
  recipe_id: string;
  created_at: string;
}

export interface LikeRow {
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface RecipeLikeRow {
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface CommentRow {
  id: string;
  user_id: string;
  recipe_id: string | null;
  post_id: string | null;
  parent_comment_id: string | null;
  body: string;
  likes_count: number;
  is_deleted: boolean;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentLikeRow {
  user_id: string;
  comment_id: string;
  created_at: string;
}

export interface FollowerRow {
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface SavedRecipeRow {
  user_id: string;
  recipe_id: string;
  created_at: string;
}

export interface CollectionRow {
  id: string;
  user_id: string;
  name: string;
  cover_image_url: string | null;
  is_default: boolean;
  created_at: string;
}

export interface CollectionRecipeRow {
  collection_id: string;
  recipe_id: string;
  added_at: string;
}

export interface RecipeReviewRow {
  id: string;
  user_id: string;
  recipe_id: string;
  rating: number;
  difficulty_feedback: DifficultyFeedback | null;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  recipe_id: string | null;
  post_id: string | null;
  comment_id: string | null;
  is_read: boolean;
  created_at: string;
}

type TableDef<Row, InsertOmit extends keyof Row, UpdateKeys extends keyof Row> = {
  Row: Row;
  Insert: Omit<Row, InsertOmit> & Partial<Pick<Row, InsertOmit>>;
  Update: Partial<Pick<Row, UpdateKeys>>;
  Relationships: never[];
};

export interface RecipeIngredientMatch {
  recipe_id: string;
  total_ingredients: number;
  matched_ingredients: number;
  missing_ingredients: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow, 'created_at' | 'updated_at' | 'followers_count' | 'following_count' | 'recipes_count' | 'posts_count', keyof ProfileRow>;
      categories: TableDef<CategoryRow, 'id' | 'created_at', keyof CategoryRow>;
      user_preferences: TableDef<UserPreferenceRow, 'created_at', keyof UserPreferenceRow>;
      ingredients: TableDef<IngredientRow, 'id' | 'created_at', keyof IngredientRow>;
      ingredient_conversions: TableDef<IngredientConversionRow, 'updated_at', keyof IngredientConversionRow>;
      recipes: TableDef<
        RecipeRow,
        'id' | 'created_at' | 'updated_at' | 'likes_count' | 'saves_count' | 'comments_count' | 'views_count' | 'cooked_count' | 'rating_avg' | 'rating_count',
        keyof RecipeRow
      >;
      recipe_categories: TableDef<RecipeCategoryRow, never, keyof RecipeCategoryRow>;
      recipe_ingredients: TableDef<RecipeIngredientRow, 'id', keyof RecipeIngredientRow>;
      recipe_steps: TableDef<RecipeStepRow, 'id', keyof RecipeStepRow>;
      recipe_media: TableDef<RecipeMediaRow, 'id', keyof RecipeMediaRow>;
      recipe_tags: TableDef<RecipeTagRow, never, keyof RecipeTagRow>;
      recipe_views: TableDef<RecipeViewRow, 'id' | 'viewed_at', keyof RecipeViewRow>;
      posts: TableDef<PostRow, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count', keyof PostRow>;
      post_media: TableDef<PostMediaRow, 'id', keyof PostMediaRow>;
      post_recipe_links: TableDef<PostRecipeLinkRow, 'created_at', keyof PostRecipeLinkRow>;
      likes: TableDef<LikeRow, 'created_at', keyof LikeRow>;
      recipe_likes: TableDef<RecipeLikeRow, 'created_at', keyof RecipeLikeRow>;
      comments: TableDef<CommentRow, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'is_deleted' | 'is_hidden', keyof CommentRow>;
      comment_likes: TableDef<CommentLikeRow, 'created_at', keyof CommentLikeRow>;
      followers: TableDef<FollowerRow, 'created_at', keyof FollowerRow>;
      saved_recipes: TableDef<SavedRecipeRow, 'created_at', keyof SavedRecipeRow>;
      collections: TableDef<CollectionRow, 'id' | 'created_at', keyof CollectionRow>;
      collection_recipes: TableDef<CollectionRecipeRow, 'added_at', keyof CollectionRecipeRow>;
      recipe_reviews: TableDef<RecipeReviewRow, 'id' | 'created_at' | 'updated_at', keyof RecipeReviewRow>;
      notifications: TableDef<NotificationRow, 'id' | 'created_at' | 'is_read', keyof NotificationRow>;
    };
    Views: {};
    Functions: {
      recipes_matching_ingredients: {
        Args: { p_ingredient_names: string[]; p_max_missing?: number; p_limit?: number };
        Returns: RecipeIngredientMatch[];
      };
    };
  };
}
