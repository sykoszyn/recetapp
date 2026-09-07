'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RecipeGrid } from '@/components/profile/recipe-grid';
import { createCollectionAction } from '@/features/collections/actions';
import type { RecipeCardData } from '@/types';

interface CollectionSummary {
  id: string;
  name: string;
}

export function SavedView({
  initialRecipes,
  collections,
}: {
  initialRecipes: RecipeCardData[];
  collections: CollectionSummary[];
}) {
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [allCollections, setAllCollections] = useState(collections);

  async function selectCollection(id: string | null) {
    setActiveCollection(id);
    setLoading(true);
    try {
      if (id === null) {
        setRecipes(initialRecipes);
      } else {
        const res = await fetch(`/api/collections/${id}/recipes`);
        const data = await res.json();
        setRecipes(data.items ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCollection() {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const collection = await createCollectionAction(newName);
      setAllCollections((prev) => [...prev, { id: collection.id, name: collection.name }]);
      setNewName('');
      setDialogOpen(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 safe-top">
      <h1 className="mb-4 text-2xl font-bold tracking-tight">Guardados</h1>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => selectCollection(null)}
          className={cn('flex-shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium', activeCollection === null ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}
        >
          Todas
        </button>
        {allCollections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => selectCollection(collection.id)}
            className={cn('flex-shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium', activeCollection === collection.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}
          >
            {collection.name}
          </button>
        ))}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex flex-shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-3.5 py-1.5 text-sm font-medium text-muted-foreground">
              <Plus className="h-3.5 w-3.5" /> Nueva colección
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva colección</DialogTitle>
            </DialogHeader>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: Postres, Para probar..." className="mt-3" />
            <Button className="mt-4 w-full" onClick={handleCreateCollection} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear colección
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <RecipeGrid recipes={recipes} emptyTitle="No guardaste ninguna receta todavía" emptyActionLabel="Descubrir recetas" emptyActionHref="/explore" />
      )}
    </div>
  );
}
