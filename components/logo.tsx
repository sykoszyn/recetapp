import { cn } from '@/lib/utils';

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-2 font-display', className)}>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg">🍳</div>
      {showText && <span className="text-lg font-bold tracking-tight">RecetApp</span>}
    </div>
  );
}
