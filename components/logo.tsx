import { cn } from '@/lib/utils';

/** Isotipo: gorro de chef sobre un cuadrado con gradiente de marca. Vectorial
 * (no emoji) para que se vea igual y nítido en cualquier sistema/navegador. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('h-9 w-9', className)} aria-hidden="true">
      <defs>
        <linearGradient id="recetapp-mark-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(14 89% 58%)" />
          <stop offset="100%" stopColor="hsl(40 95% 55%)" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="7" fill="url(#recetapp-mark-gradient)" />
      <circle cx="7.5" cy="13.2" r="3" fill="white" />
      <circle cx="16.5" cy="13.2" r="3" fill="white" />
      <circle cx="12" cy="10.8" r="4.6" fill="white" />
      <rect x="6.5" y="16.2" width="11" height="3.4" rx="1.7" fill="white" />
    </svg>
  );
}

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 font-display', className)}>
      <LogoMark />
      {showText && <span className="text-lg font-bold tracking-tight">RecetApp</span>}
    </div>
  );
}
