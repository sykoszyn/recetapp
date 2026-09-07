'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { PostMediaRow } from '@/types/database';

export function PostMediaViewer({ media }: { media: PostMediaRow[] }) {
  const [active, setActive] = useState(0);

  if (!media.length) return null;

  return (
    <div className="relative">
      <div
        className="flex snap-x snap-mandatory overflow-x-auto no-scrollbar"
        onScroll={(e) => {
          const el = e.currentTarget;
          const index = Math.round(el.scrollLeft / el.clientWidth);
          setActive(index);
        }}
      >
        {media.map((item) => (
          <div key={item.id} className="relative aspect-square w-full flex-shrink-0 snap-center bg-muted">
            {item.media_type === 'video' ? (
              <video src={item.url} poster={item.thumbnail_url ?? undefined} controls playsInline className="h-full w-full object-cover" />
            ) : (
              <Image src={item.url} alt="" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" />
            )}
          </div>
        ))}
      </div>

      {media.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {media.map((item, index) => (
            <span key={item.id} className={cn('h-1.5 w-1.5 rounded-full bg-white/60', index === active && 'bg-white')} />
          ))}
        </div>
      )}
    </div>
  );
}
