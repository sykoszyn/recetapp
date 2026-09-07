'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { uploadToBucket } from '@/services/storage';
import { useToast } from '@/hooks/use-toast';
import type { RecipeWizardState } from '../recipe-wizard';

export function MediaStep({
  state,
  update,
  userId,
}: {
  state: RecipeWizardState;
  update: (patch: Partial<RecipeWizardState>) => void;
  userId: string;
}) {
  const { toast } = useToast();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<'cover' | 'gallery' | 'video' | null>(null);

  async function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('cover');
    try {
      const supabase = createClient();
      const { publicUrl } = await uploadToBucket(supabase, 'recipes', userId, file, { folder: 'cover' });
      update({ cover_image_url: publicUrl });
    } catch (err) {
      toast({ variant: 'destructive', description: err instanceof Error ? err.message : 'No se pudo subir la imagen.' });
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  }

  async function handleGalleryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading('gallery');
    try {
      const supabase = createClient();
      const uploaded = await Promise.all(
        files.map((file) => uploadToBucket(supabase, 'recipes', userId, file, { folder: 'gallery' }))
      );
      update({
        media: [...state.media, ...uploaded.map((u) => ({ media_type: 'image' as const, url: u.publicUrl }))],
      });
    } catch (err) {
      toast({ variant: 'destructive', description: err instanceof Error ? err.message : 'No se pudieron subir las fotos.' });
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading('video');
    try {
      const supabase = createClient();
      const { publicUrl } = await uploadToBucket(supabase, 'recipe-videos', userId, file, { compress: false });
      update({ video_url: publicUrl });
    } catch (err) {
      toast({ variant: 'destructive', description: err instanceof Error ? err.message : 'No se pudo subir el video.' });
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  }

  function removeGalleryItem(index: number) {
    update({ media: state.media.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium">Foto principal</p>
        <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
        {state.cover_image_url ? (
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
            <Image src={state.cover_image_url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => update({ cover_image_url: null })}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploading === 'cover'}
            className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-muted-foreground"
          >
            {uploading === 'cover' ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            Subir foto principal
          </button>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Galería (opcional)</p>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGalleryChange} />
        <div className="flex flex-wrap gap-2">
          {state.media.map((item, index) => (
            <div key={item.url} className="relative h-20 w-20 overflow-hidden rounded-xl">
              <Image src={item.url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => removeGalleryItem(index)}
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploading === 'gallery'}
            className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border text-muted-foreground"
          >
            {uploading === 'gallery' ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Video de la receta (opcional)</p>
        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoChange} />
        {state.video_url ? (
          <div className="relative">
            <video src={state.video_url} controls className="aspect-video w-full rounded-2xl bg-muted" />
            <button
              type="button"
              onClick={() => update({ video_url: null })}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Button type="button" variant="outline" className="gap-2" onClick={() => videoInputRef.current?.click()} disabled={uploading === 'video'}>
            {uploading === 'video' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
            Subir video
          </Button>
        )}
      </div>
    </div>
  );
}
