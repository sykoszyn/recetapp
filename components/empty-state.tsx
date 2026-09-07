import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EmptyState({
  emoji = '🍽️',
  title,
  description,
  actionLabel,
  actionHref,
}: {
  emoji?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="mt-2 font-semibold">{title}</p>
      {description && <p className="max-w-xs text-sm text-muted-foreground">{description}</p>}
      {actionLabel && actionHref && (
        <Button asChild className="mt-4">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
