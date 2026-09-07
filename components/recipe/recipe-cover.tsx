import Image from 'next/image';
import { cn } from '@/lib/utils';

const FALLBACK_GRADIENTS = [
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-red-500',
  'from-fuchsia-400 to-pink-500',
  'from-sky-400 to-blue-500',
];

function gradientFor(seed: string) {
  const index = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % FALLBACK_GRADIENTS.length;
  return FALLBACK_GRADIENTS[index];
}

export function RecipeCover({
  src,
  alt,
  seed,
  className,
  sizes = '(max-width: 768px) 100vw, 33vw',
  priority = false,
}: {
  src: string | null;
  alt: string;
  seed: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className={cn('flex items-center justify-center bg-gradient-to-br text-5xl', gradientFor(seed), className)}>
        🍽️
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
