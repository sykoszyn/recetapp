import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ReviewDialog } from './review-dialog';
import { EmptyState } from '@/components/empty-state';
import { formatRelativeTime } from '@/lib/utils';
import { DIFFICULTY_FEEDBACK_LABELS } from '@/types';
import type { ReviewWithAuthor } from '@/types';

export function ReviewsSection({
  reviews,
  recipeId,
  recipeSlug,
  canReview,
}: {
  reviews: ReviewWithAuthor[];
  recipeId: string;
  recipeSlug: string;
  canReview: boolean;
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Valoraciones</h2>
        {canReview && <ReviewDialog recipeId={recipeId} recipeSlug={recipeSlug} />}
      </div>

      {reviews.length === 0 ? (
        <EmptyState emoji="⭐" title="Todavía no hay valoraciones" description="Cociná esta receta y sé el primero en calificarla." />
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="flex gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={review.author.avatar_url ?? undefined} />
                <AvatarFallback>{review.author.full_name.slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold">@{review.author.username}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-warning text-warning' : 'text-muted'}`} />
                    ))}
                  </div>
                  {review.difficulty_feedback && (
                    <span className="text-xs text-muted-foreground">{DIFFICULTY_FEEDBACK_LABELS[review.difficulty_feedback]}</span>
                  )}
                </div>
                {review.comment && <p className="mt-1 text-sm">{review.comment}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(review.created_at)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
