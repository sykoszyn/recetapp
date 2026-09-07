import Link from 'next/link';
import { Clock, Users } from 'lucide-react';
import { RecipeCover } from '@/components/recipe/recipe-cover';
import { LikeButton } from '@/components/interactions/like-button';
import { SaveButton } from '@/components/interactions/save-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DIFFICULTY_LABELS } from '@/types';
import { formatDuration } from '@/lib/utils';
import type { RecipeCardData } from '@/types';

export function RecipeFeedCard({ recipe, isAuthenticated }: { recipe: RecipeCardData; isAuthenticated: boolean }) {
  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-fade-up">
      <Link href={`/recipe/${recipe.slug}`} className="block">
        <RecipeCover src={recipe.cover_image_url} alt={recipe.title} seed={recipe.id} className="aspect-[4/5] w-full" />
      </Link>

      <div className="p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{DIFFICULTY_LABELS[recipe.difficulty]}</Badge>
          {totalTime > 0 && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {formatDuration(totalTime)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" /> {recipe.servings}
          </span>
        </div>

        <Link href={`/recipe/${recipe.slug}`}>
          <h3 className="mb-1 text-lg font-semibold leading-snug hover:text-primary">{recipe.title}</h3>
        </Link>

        <Link href={`/user/${recipe.author.username}`} className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarImage src={recipe.author.avatar_url ?? undefined} />
            <AvatarFallback>{recipe.author.full_name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          @{recipe.author.username}
        </Link>

        <div className="flex items-center justify-between">
          <LikeButton
            target="recipe"
            targetId={recipe.id}
            initialLiked={!!recipe.is_liked}
            initialCount={recipe.likes_count}
            isAuthenticated={isAuthenticated}
            size="sm"
          />
          <SaveButton recipeId={recipe.id} initialSaved={!!recipe.is_saved} isAuthenticated={isAuthenticated} size="sm" />
        </div>
      </div>
    </article>
  );
}
