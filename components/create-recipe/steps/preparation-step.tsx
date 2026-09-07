'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { GripVertical, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { uploadToBucket } from '@/services/storage';
import type { RecipeWizardState } from '../recipe-wizard';

export function PreparationStep({
  state,
  update,
  userId,
}: {
  state: RecipeWizardState;
  update: (patch: Partial<RecipeWizardState>) => void;
  userId: string;
}) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeIndexRef = useRef<number | null>(null);

  function addStep() {
    update({ steps: [...state.steps, { title: '', description: '', image_url: null, video_url: null, timer_seconds: null }] });
  }

  function updateStep(index: number, patch: Partial<(typeof state.steps)[number]>) {
    update({ steps: state.steps.map((s, i) => (i === index ? { ...s, ...patch } : s)) });
  }

  function removeStep(index: number) {
    update({ steps: state.steps.filter((_, i) => i !== index) });
  }

  function triggerUpload(index: number) {
    activeIndexRef.current = index;
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const index = activeIndexRef.current;
    if (!file || index === null) return;
    setUploadingIndex(index);
    try {
      const supabase = createClient();
      const { publicUrl } = await uploadToBucket(supabase, 'recipes', userId, file, { folder: 'steps' });
      updateStep(index, { image_url: publicUrl });
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <p className="text-sm text-muted-foreground">Agregá los pasos en orden. Podés sumar una foto a cada uno.</p>

      {state.steps.map((step, index) => (
        <div key={index} className="rounded-xl border border-border p-3">
          <div className="mb-2 flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {index + 1}
            </span>
            <Input
              placeholder="Título (opcional)"
              value={step.title ?? ''}
              onChange={(e) => updateStep(index, { title: e.target.value })}
              className="h-9 flex-1"
            />
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeStep(index)} aria-label="Eliminar paso">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <Textarea
            placeholder="Describí este paso..."
            value={step.description}
            onChange={(e) => updateStep(index, { description: e.target.value })}
            className="mb-2"
          />

          <div className="flex items-center gap-3">
            <Input
              type="number"
              placeholder="Timer (seg, opcional)"
              value={step.timer_seconds ?? ''}
              onChange={(e) => updateStep(index, { timer_seconds: e.target.value ? Number(e.target.value) : null })}
              className="h-9 max-w-40"
            />

            {step.image_url ? (
              <div className="relative h-14 w-14 overflow-hidden rounded-lg">
                <Image src={step.image_url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => updateStep(index, { image_url: null })}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => triggerUpload(index)} disabled={uploadingIndex === index}>
                {uploadingIndex === index ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                Foto
              </Button>
            )}
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addStep} className="w-full gap-2">
        <Plus className="h-4 w-4" /> Agregar paso
      </Button>
    </div>
  );
}
