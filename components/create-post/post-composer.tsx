'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2, Star, Utensils, Video, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RecipeCover } from '@/components/recipe/recipe-cover';
import { RecipePickerDialog, type PickableRecipe } from './recipe-picker-dialog';
import { createClient } from '@/lib/supabase/client';
import { uploadToBucket } from '@/services/storage';
import { createPostAction } from '@/features/posts/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { DIFFICULTY_FEEDBACK_LABELS } from '@/types';
import type { DifficultyFeedback } from '@/types/database';

interface MediaFile {
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}

export function PostComposer({ userId, initialRecipe }: { userId: string; initialRecipe: PickableRecipe | null }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [caption, setCaption] = useState('');
  const [recipe, setRecipe] = useState<PickableRecipe | null>(initialRecipe);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(initialRecipe ? 5 : null);
  const [difficulty, setDifficulty] = useState<DifficultyFeedback | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const next = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? ('video' as const) : ('image' as const),
    }));
    setMediaFiles((prev) => [...prev, ...next]);
    e.target.value = '';
  }

  function removeMedia(index: number) {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!mediaFiles.length) {
      toast({ variant: 'destructive', description: 'Agregá al menos una foto o video.' });
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      const uploaded = await Promise.all(
        mediaFiles.map(async (m) => {
          const bucket = m.type === 'video' ? 'recipe-videos' : 'posts';
          const { publicUrl } = await uploadToBucket(supabase, bucket, userId, m.file, { compress: m.type === 'image' });
          return { media_type: m.type, url: publicUrl };
        })
      );

      const result = await createPostAction({
        caption,
        recipe_id: recipe?.id ?? null,
        rating: recipe ? rating : null,
        difficulty_feedback: recipe ? difficulty : null,
        media: uploaded,
      });

      if (result.error) {
        toast({ variant: 'destructive', description: result.error });
        return;
      }

      toast({ variant: 'success', description: '¡Publicación creada!' });
      router.push(result.postId ? `/post/${result.postId}` : '/feed');
    } catch (err) {
      toast({ variant: 'destructive', description: err instanceof Error ? err.message : 'No se pudo publicar.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 pb-28 safe-top">
      <h1 className="mb-6 text-lg font-bold">Nueva publicación</h1>

      <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFilesSelected} />

      <div className="mb-4 flex flex-wrap gap-2">
        {mediaFiles.map((media, index) => (
          <div key={media.previewUrl} className="relative h-24 w-24 overflow-hidden rounded-xl">
            {media.type === 'video' ? (
              <video src={media.previewUrl} className="h-full w-full object-cover" />
            ) : (
              <Image src={media.previewUrl} alt="" fill className="object-cover" />
            )}
            <button onClick={() => removeMedia(index)} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-xs text-muted-foreground"
        >
          <Video className="h-5 w-5" /> Foto/video
        </button>
      </div>

      <Textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Contá cómo te quedó..."
        className="mb-4"
        maxLength={500}
      />

      {recipe ? (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-border p-3">
          <RecipeCover src={recipe.cover_image_url} alt={recipe.title} seed={recipe.id} className="h-12 w-12 flex-shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Receta utilizada</p>
            <p className="truncate text-sm font-semibold">{recipe.title}</p>
          </div>
          <button onClick={() => setRecipe(null)} aria-label="Quitar receta asociada">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <Button type="button" variant="outline" className="mb-4 w-full gap-2" onClick={() => setPickerOpen(true)}>
          <Utensils className="h-4 w-4" /> Asociar receta
        </Button>
      )}

      {recipe && (
        <div className="mb-6 space-y-4 rounded-xl border border-border p-4">
          <div>
            <p className="mb-2 text-sm font-medium">Calificación (opcional)</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button key={value} type="button" onClick={() => setRating(rating === value ? null : value)}>
                  <Star className={cn('h-7 w-7', rating && value <= rating ? 'fill-warning text-warning' : 'text-muted')} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Dificultad (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(DIFFICULTY_FEEDBACK_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDifficulty(difficulty === value ? null : (value as DifficultyFeedback))}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium',
                    difficulty === value ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <RecipePickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onSelect={(r) => { setRecipe(r); setPickerOpen(false); }} />

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur safe-bottom">
        <div className="mx-auto max-w-lg">
          <Button className="w-full" size="lg" disabled={submitting} onClick={handleSubmit}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Publicar
          </Button>
        </div>
      </div>
    </div>
  );
}
