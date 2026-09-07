'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { saveRecipeAction } from '@/features/recipes/actions';
import type { CategoryRow } from '@/types/database';
import type { RecipeIngredientFormValue, RecipeStepFormValue } from '@/features/recipes/schema';
import { WizardProgress } from './wizard-progress';
import { InfoStep } from './steps/info-step';
import { IngredientsStep } from './steps/ingredients-step';
import { PreparationStep } from './steps/preparation-step';
import { MediaStep } from './steps/media-step';
import { PublishStep } from './steps/publish-step';

export interface RecipeWizardState {
  title: string;
  description: string;
  difficulty: 'facil' | 'media' | 'dificil';
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number;
  category_ids: string[];
  cover_image_url: string | null;
  video_url: string | null;
  media: { media_type: 'image' | 'video'; url: string }[];
  ingredients: RecipeIngredientFormValue[];
  steps: RecipeStepFormValue[];
  notes: string;
  tags: string[];
}

const EMPTY_STATE: RecipeWizardState = {
  title: '',
  description: '',
  difficulty: 'facil',
  prep_time_minutes: null,
  cook_time_minutes: null,
  servings: 4,
  category_ids: [],
  cover_image_url: null,
  video_url: null,
  media: [],
  ingredients: [{ quantity: null, unit: '', ingredient_id: null, name_snapshot: '', notes: '' }],
  steps: [{ title: '', description: '', image_url: null, video_url: null, timer_seconds: null }],
  notes: '',
  tags: [],
};

const DRAFT_KEY = 'recetapp:recipe-draft';

export function RecipeWizard({
  userId,
  categories,
  initialState,
  recipeId,
}: {
  userId: string;
  categories: CategoryRow[];
  initialState?: RecipeWizardState;
  recipeId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditing = !!recipeId;
  const [step, setStep] = useState(0);
  const [state, setState] = useState<RecipeWizardState>(initialState ?? EMPTY_STATE);
  const [submitting, setSubmitting] = useState<'draft' | 'published' | null>(null);
  const [hydrated, setHydrated] = useState(isEditing);

  useEffect(() => {
    if (isEditing) return;
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {
      // ignore borrador corrupto
    } finally {
      setHydrated(true);
    }
  }, [isEditing]);

  useEffect(() => {
    if (!hydrated || isEditing) return;
    const timeout = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(state));
    }, 600);
    return () => clearTimeout(timeout);
  }, [state, hydrated, isEditing]);

  function update(patch: Partial<RecipeWizardState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(status: 'draft' | 'published') {
    setSubmitting(status);
    const result = await saveRecipeAction(
      {
        title: state.title,
        description: state.description,
        cover_image_url: state.cover_image_url,
        video_url: state.video_url,
        difficulty: state.difficulty,
        prep_time_minutes: state.prep_time_minutes,
        cook_time_minutes: state.cook_time_minutes,
        servings: state.servings,
        notes: state.notes,
        status,
        category_ids: state.category_ids,
        tags: state.tags,
        ingredients: state.ingredients.filter((i) => i.name_snapshot.trim()),
        steps: state.steps.filter((s) => s.description.trim()),
        media: state.media,
      },
      recipeId
    );
    setSubmitting(null);

    if (result.error) {
      toast({ variant: 'destructive', description: result.error });
      return;
    }

    if (!isEditing) localStorage.removeItem(DRAFT_KEY);
    toast({ variant: 'success', description: status === 'published' ? '¡Receta publicada!' : 'Borrador guardado.' });
    router.push(result.slug ? `/recipe/${result.slug}` : '/feed');
  }

  const isLastStep = step === 4;

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-28 safe-top">
      <div className="mb-4 flex items-center gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} aria-label="Volver">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg font-bold">{isEditing ? 'Editar receta' : 'Nueva receta'}</h1>
      </div>

      <WizardProgress current={step} />

      {step === 0 && <InfoStep state={state} update={update} categories={categories} />}
      {step === 1 && <IngredientsStep state={state} update={update} />}
      {step === 2 && <PreparationStep state={state} update={update} userId={userId} />}
      {step === 3 && <MediaStep state={state} update={update} userId={userId} />}
      {step === 4 && <PublishStep state={state} update={update} />}

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur safe-bottom">
        <div className="mx-auto flex max-w-lg gap-3">
          {isLastStep ? (
            <>
              <Button variant="outline" className="flex-1" disabled={!!submitting} onClick={() => handleSubmit('draft')}>
                {submitting === 'draft' && <Loader2 className="h-4 w-4 animate-spin" />}
                Guardar borrador
              </Button>
              <Button className="flex-1" disabled={!!submitting} onClick={() => handleSubmit('published')}>
                {submitting === 'published' && <Loader2 className="h-4 w-4 animate-spin" />}
                Publicar
              </Button>
            </>
          ) : (
            <Button className="w-full" disabled={step === 0 && !state.title.trim()} onClick={() => setStep((s) => s + 1)}>
              Continuar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
