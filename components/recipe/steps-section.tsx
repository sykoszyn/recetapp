'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { RecipeStepRow } from '@/types/database';

export function StepsSection({ steps, videoUrl }: { steps: RecipeStepRow[]; videoUrl: string | null }) {
  const [mode, setMode] = useState<'written' | 'video'>('written');

  return (
    <div id="video">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">Preparación</h2>
        {videoUrl && (
          <Tabs value={mode} onValueChange={(v) => setMode(v as 'written' | 'video')}>
            <TabsList>
              <TabsTrigger value="written">Escrita</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {mode === 'video' && videoUrl ? (
        <video src={videoUrl} controls playsInline className="aspect-video w-full rounded-2xl bg-muted" />
      ) : (
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step.id} className="flex gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <div className="flex-1">
                {step.title && <p className="font-semibold">{step.title}</p>}
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.image_url && (
                  <div className="relative mt-2 aspect-video w-full max-w-sm overflow-hidden rounded-xl">
                    <Image src={step.image_url} alt="" fill className="object-cover" />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
