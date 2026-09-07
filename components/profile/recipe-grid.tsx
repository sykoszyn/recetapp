import Link from 'next/link';
import { RecipeCover } from '@/components/recipe/recipe-cover';
import { EmptyState } from '@/components/empty-state';
import type { RecipeCardData } from '@/types';

export function RecipeGrid({
  recipes,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionHref,
}: {
  recipes: RecipeCardData[];
  emptyTitle: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
}) {
  if (!recipes.length) {
    return (
      <EmptyState emoji="🍽️" title={emptyTitle} description={emptyDescription} actionLabel={emptyActionLabel} actionHref={emptyActionHref} />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {recipes.map((recipe) => (
        <Link key={recipe.id} href={`/recipe/${recipe.slug}`}>
          <RecipeCover src={recipe.cover_image_url} alt={recipe.title} seed={recipe.id} className="aspect-square rounded-xl" />
          <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug">{recipe.title}</p>
        </Link>
      ))}
    </div>
  );
}
