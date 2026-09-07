import Link from 'next/link';
import { ChefHat, Clock, Star, Users } from 'lucide-react';
import { RecipeCover } from '@/components/recipe/recipe-cover';
import { LikeButton } from '@/components/interactions/like-button';
import { SaveButton } from '@/components/interactions/save-button';
import { ShareButton } from '@/components/interactions/share-button';
import { FollowButton } from '@/components/profile/follow-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DIFFICULTY_LABELS } from '@/types';
import { formatDuration } from '@/lib/utils';
import type { RecipeDetail } from '@/types';

export function RecipeHero({
  recipe,
  isAuthenticated,
  isOwner,
  isFollowingAuthor,
}: {
  recipe: RecipeDetail;
  isAuthenticated: boolean;
  isOwner: boolean;
  isFollowingAuthor: boolean;
}) {
  const totalTime = (recipe.prep_time_minutes ?? 0) + (recipe.cook_time_minutes ?? 0);

  return (
    <div>
      <RecipeCover
        src={recipe.cover_image_url}
        alt={recipe.title}
        seed={recipe.id}
        className="aspect-[4/3] w-full md:aspect-[16/7] md:rounded-2xl"
        priority
        sizes="100vw"
      />

      <div className="px-4 pt-4 md:px-0">
        <div className="mb-2 flex flex-wrap gap-2">
          {recipe.categories.map((c) => (
            <Badge key={c.id} variant="muted">
              {c.emoji} {c.name}
            </Badge>
          ))}
        </div>

        <h1 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">{recipe.title}</h1>
        {recipe.description && <p className="mb-3 text-muted-foreground">{recipe.description}</p>}

        <div className="mb-4 flex items-center justify-between">
          <Link href={`/user/${recipe.author.username}`} className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={recipe.author.avatar_url ?? undefined} />
              <AvatarFallback>{recipe.author.full_name.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">@{recipe.author.username}</p>
            </div>
          </Link>
          {!isOwner && (
            <FollowButton targetUserId={recipe.author.id} initialFollowing={isFollowingAuthor} isAuthenticated={isAuthenticated} size="sm" />
          )}
          {isOwner && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/recipe/${recipe.slug}/edit`}>Editar</Link>
            </Button>
          )}
        </div>

        <div className="mb-4 grid grid-cols-4 divide-x divide-border rounded-2xl border border-border py-3 text-center">
          <div>
            <Star className="mx-auto mb-1 h-4 w-4 fill-warning text-warning" />
            <p className="text-sm font-semibold">{recipe.rating_avg > 0 ? recipe.rating_avg.toFixed(1) : '—'}</p>
            <p className="text-[11px] text-muted-foreground">{recipe.rating_count} reseñas</p>
          </div>
          <div>
            <Clock className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{formatDuration(totalTime) ?? '—'}</p>
            <p className="text-[11px] text-muted-foreground">tiempo</p>
          </div>
          <div>
            <Users className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{recipe.servings}</p>
            <p className="text-[11px] text-muted-foreground">porciones</p>
          </div>
          <div>
            <ChefHat className="mx-auto mb-1 h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold">{DIFFICULTY_LABELS[recipe.difficulty]}</p>
            <p className="text-[11px] text-muted-foreground">dificultad</p>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <LikeButton target="recipe" targetId={recipe.id} initialLiked={!!recipe.is_liked} initialCount={recipe.likes_count} isAuthenticated={isAuthenticated} />
            <SaveButton recipeId={recipe.id} initialSaved={!!recipe.is_saved} isAuthenticated={isAuthenticated} showLabel />
            <ShareButton url={`/recipe/${recipe.slug}`} title={recipe.title} />
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row">
          <Button size="lg" className="flex-1" asChild>
            <Link href={`/recipe/${recipe.slug}/cook`}>Empezar a cocinar</Link>
          </Button>
          {recipe.video_url && (
            <Button size="lg" variant="outline" className="flex-1" asChild>
              <Link href="#video">Ver video</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
