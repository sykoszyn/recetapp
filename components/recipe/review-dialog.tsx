'use client';

import { useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createReviewAction } from '@/features/reviews/actions';
import { DIFFICULTY_FEEDBACK_LABELS } from '@/types';
import { useToast } from '@/hooks/use-toast';

const DIFFICULTIES = Object.entries(DIFFICULTY_FEEDBACK_LABELS) as [keyof typeof DIFFICULTY_FEEDBACK_LABELS, string][];

export function ReviewDialog({ recipeId, recipeSlug }: { recipeId: string; recipeSlug: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    const result = await createReviewAction({ recipeId, recipeSlug, rating, difficultyFeedback: difficulty, comment });
    setSubmitting(false);
    if (result.error) {
      toast({ variant: 'destructive', description: result.error });
      return;
    }
    toast({ variant: 'success', description: '¡Gracias por tu reseña!' });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Dejar una reseña
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Cómo te fue con esta receta?</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setRating(value)} aria-label={`${value} estrellas`}>
              <Star className={cn('h-8 w-8', value <= rating ? 'fill-warning text-warning' : 'text-muted')} />
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {DIFFICULTIES.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setDifficulty(value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium',
                difficulty === value ? 'border-primary bg-primary/10 text-primary' : 'border-border'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <Textarea
          className="mt-4"
          placeholder="Contá algún tip o cómo la adaptaste..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <Button className="mt-4 w-full" onClick={handleSubmit} disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Enviar reseña
        </Button>
      </DialogContent>
    </Dialog>
  );
}
