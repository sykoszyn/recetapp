import Link from 'next/link';
import { RecipeCover } from '@/components/recipe/recipe-cover';
import type { RecipeCardData } from '@/types';

export function SimilarRecipes({ recipes }: { recipes: RecipeCardData[] }) {
  if (!recipes.length) return null;

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Recetas similares</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
        {recipes.map((recipe) => (
          <Link key={recipe.id} href={`/recipe/${recipe.slug}`} className="w-36 flex-shrink-0">
            <RecipeCover src={recipe.cover_image_url} alt={recipe.title} seed={recipe.id} className="aspect-square w-36 rounded-xl" />
            <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug">{recipe.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
