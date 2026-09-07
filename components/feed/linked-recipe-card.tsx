import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { RecipeCover } from '@/components/recipe/recipe-cover';
import type { LinkedRecipeSummary } from '@/types';

export function LinkedRecipeCard({ recipe }: { recipe: LinkedRecipeSummary }) {
  return (
    <Link
      href={`/recipe/${recipe.slug}`}
      className="mx-4 mb-3 flex items-center gap-3 rounded-xl border border-border bg-muted/60 p-2.5 transition-colors hover:bg-muted"
    >
      <RecipeCover src={recipe.cover_image_url} alt={recipe.title} seed={recipe.id} className="h-12 w-12 flex-shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">🍳 Preparado con</p>
        <p className="truncate text-sm font-semibold leading-tight">{recipe.title}</p>
        <p className="truncate text-xs text-muted-foreground">receta de @{recipe.author_username}</p>
      </div>
      <span className="flex items-center gap-1 whitespace-nowrap text-xs font-semibold text-primary">
        Ver receta <ChevronRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  );
}
