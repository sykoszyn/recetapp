import Link from 'next/link';
import { BookPlus, ImagePlus } from 'lucide-react';

export default function CreateChooserPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-8 safe-top">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">¿Qué querés crear?</h1>
      <div className="grid gap-4">
        <Link
          href="/create/recipe"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BookPlus className="h-7 w-7" />
          </span>
          <div>
            <p className="font-semibold">Crear receta</p>
            <p className="text-sm text-muted-foreground">Compartí una receta completa con ingredientes y pasos.</p>
          </div>
        </Link>

        <Link
          href="/create/post"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
            <ImagePlus className="h-7 w-7" />
          </span>
          <div>
            <p className="font-semibold">Crear publicación</p>
            <p className="text-sm text-muted-foreground">Mostrá cómo te quedó algo que cocinaste.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
