'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { RecipeCover } from '@/components/recipe/recipe-cover';
import { EmptyState } from '@/components/empty-state';

export interface PickableRecipe {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
}

export function RecipePickerDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (recipe: PickableRecipe) => void;
}) {
  const [tab, setTab] = useState('saved');
  const [items, setItems] = useState<PickableRecipe[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/recipes/pickable?tab=${tab}`)
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, [open, tab]);

  const filtered = items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asociar receta</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-3">
          <TabsList>
            <TabsTrigger value="saved">Guardadas</TabsTrigger>
            <TabsTrigger value="recent">Hechas hace poco</TabsTrigger>
            <TabsTrigger value="own">Propias</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar receta..." className="pl-9" />
        </div>

        <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
          {loading && <p className="py-6 text-center text-sm text-muted-foreground">Cargando...</p>}
          {!loading && filtered.length === 0 && <EmptyState emoji="🍽️" title="No hay recetas para mostrar" />}
          {filtered.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => onSelect(recipe)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-muted"
            >
              <RecipeCover src={recipe.cover_image_url} alt={recipe.title} seed={recipe.id} className="h-12 w-12 flex-shrink-0 rounded-lg" />
              <span className="text-sm font-medium">{recipe.title}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
