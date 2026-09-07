import type {
  CategoryRow,
  CommentRow,
  DifficultyFeedback,
  DifficultyLevel,
  NotificationRow,
  NotificationType,
  PostMediaRow,
  PostRow,
  ProfileRow,
  RecipeIngredientRow,
  RecipeMediaRow,
  RecipeReviewRow,
  RecipeRow,
  RecipeStepRow,
} from './database';

export type PublicProfile = Pick<ProfileRow, 'id' | 'username' | 'full_name' | 'avatar_url'>;

export interface RecipeCardData extends RecipeRow {
  author: PublicProfile;
  categories: Pick<CategoryRow, 'id' | 'name' | 'slug' | 'emoji'>[];
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface RecipeDetail extends RecipeCardData {
  ingredients: RecipeIngredientRow[];
  steps: RecipeStepRow[];
  media: RecipeMediaRow[];
  tags: string[];
}

export type LinkedRecipeSummary = Pick<RecipeRow, 'id' | 'title' | 'slug' | 'cover_image_url'> & {
  author_username: string;
};

export interface PostCardData extends PostRow {
  author: PublicProfile;
  media: PostMediaRow[];
  linked_recipe: LinkedRecipeSummary | null;
  is_liked?: boolean;
}

export interface CommentWithAuthor extends CommentRow {
  author: PublicProfile;
  is_liked?: boolean;
  replies?: CommentWithAuthor[];
}

export interface ReviewWithAuthor extends RecipeReviewRow {
  author: PublicProfile;
}

export interface NotificationWithActor extends NotificationRow {
  actor: PublicProfile | null;
  recipe_title?: string | null;
  recipe_slug?: string | null;
}

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  facil: 'Fácil',
  media: 'Media',
  dificil: 'Difícil',
};

export const DIFFICULTY_FEEDBACK_LABELS: Record<DifficultyFeedback, string> = {
  muy_facil: 'Muy fácil',
  facil: 'Fácil',
  normal: 'Normal',
  dificil: 'Difícil',
};

export const NOTIFICATION_MESSAGES: Record<NotificationType, (actor: string) => string> = {
  like_post: (actor) => `A ${actor} le gustó tu publicación.`,
  like_recipe: (actor) => `A ${actor} le gustó tu receta.`,
  follow: (actor) => `${actor} empezó a seguirte.`,
  comment_recipe: (actor) => `${actor} comentó tu receta.`,
  comment_post: (actor) => `${actor} comentó tu publicación.`,
  reply_comment: (actor) => `${actor} respondió tu comentario.`,
  recipe_cooked: (actor) => `${actor} hizo tu receta.`,
  milestone_saves: () => `Tu receta llegó a un nuevo hito de guardados.`,
};

// ── Conversor de medidas ────────────────────────────────────────────────
export type VolumeUnit = 'ml' | 'l' | 'cc' | 'cup' | 'half_cup' | 'quarter_cup' | 'tbsp' | 'tsp';
export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb';
export type MeasurementUnit = VolumeUnit | WeightUnit;

export const VOLUME_UNITS: VolumeUnit[] = ['ml', 'l', 'cc', 'cup', 'half_cup', 'quarter_cup', 'tbsp', 'tsp'];
export const WEIGHT_UNITS: WeightUnit[] = ['g', 'kg', 'oz', 'lb'];

export const UNIT_LABELS: Record<MeasurementUnit, string> = {
  ml: 'ml',
  l: 'litros',
  cc: 'cc',
  cup: 'taza',
  half_cup: 'media taza',
  quarter_cup: 'cuarto de taza',
  tbsp: 'cucharada',
  tsp: 'cucharadita',
  g: 'gramos',
  kg: 'kilogramos',
  oz: 'onzas',
  lb: 'libras',
};

export function isVolumeUnit(unit: string): unit is VolumeUnit {
  return (VOLUME_UNITS as string[]).includes(unit);
}

export function isWeightUnit(unit: string): unit is WeightUnit {
  return (WEIGHT_UNITS as string[]).includes(unit);
}
