import { cn } from '@/lib/utils';

export const WIZARD_STEPS = ['Información', 'Ingredientes', 'Preparación', 'Fotos/video', 'Publicar'];

export function WizardProgress({ current }: { current: number }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground">
        {WIZARD_STEPS.map((label, index) => (
          <span key={label} className={cn(index === current && 'text-primary')}>
            {label}
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        {WIZARD_STEPS.map((label, index) => (
          <div key={label} className={cn('h-1.5 flex-1 rounded-full', index <= current ? 'bg-primary' : 'bg-muted')} />
        ))}
      </div>
    </div>
  );
}
