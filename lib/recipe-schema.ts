import type { RecipeDetail } from '@/types';

function toIsoDuration(minutes: number | null) {
  if (!minutes || minutes <= 0) return undefined;
  return `PT${minutes}M`;
}

/** JSON-LD schema.org/Recipe para SEO y rich snippets de Google. */
export function buildRecipeJsonLd(recipe: RecipeDetail, siteUrl: string) {
  const totalMinutes = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return {
    '@context': 'https://schema.org/',
    '@type': 'Recipe',
    name: recipe.title,
    image: recipe.cover_image_url ? [recipe.cover_image_url] : undefined,
    author: { '@type': 'Person', name: recipe.author.full_name || recipe.author.username },
    datePublished: recipe.published_at ?? recipe.created_at,
    description: recipe.description,
    prepTime: toIsoDuration(recipe.prep_time_minutes),
    cookTime: toIsoDuration(recipe.cook_time_minutes),
    totalTime: toIsoDuration(totalMinutes),
    recipeYield: `${recipe.servings} porciones`,
    recipeCategory: recipe.categories[0]?.name,
    recipeIngredient: recipe.ingredients.map((i) => [i.quantity, i.unit, i.name_snapshot].filter(Boolean).join(' ')),
    recipeInstructions: recipe.steps.map((step) => ({
      '@type': 'HowToStep',
      name: step.title ?? undefined,
      text: step.description,
      image: step.image_url ?? undefined,
    })),
    video: recipe.video_url
      ? {
          '@type': 'VideoObject',
          name: recipe.title,
          thumbnailUrl: recipe.video_thumbnail_url ?? recipe.cover_image_url ?? undefined,
          contentUrl: recipe.video_url,
          uploadDate: recipe.created_at,
        }
      : undefined,
    aggregateRating:
      recipe.rating_count > 0
        ? { '@type': 'AggregateRating', ratingValue: recipe.rating_avg, reviewCount: recipe.rating_count }
        : undefined,
    nutrition: recipe.calories_per_serving
      ? { '@type': 'NutritionInformation', calories: `${recipe.calories_per_serving} cal` }
      : undefined,
    url: `${siteUrl}/recipe/${recipe.slug}`,
  };
}
