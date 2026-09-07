'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RecipeCover } from '@/components/recipe/recipe-cover';
import { EmptyState } from '@/components/empty-state';
import type { IngredientMatchResult } from '@/services/recipes';

const GROUPS = [
  { key: 0, label: 'Tengo todos los ingredientes' },
  { key: 1, label: 'Me falta 1 ingrediente' },
  { key: 2, label: 'Me faltan 2 ingredientes' },
];

export function WhatCanICookView() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<IngredientMatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  function addIngredient() {
    const value = input.trim();
    if (!value || ingredients.includes(value)) return;
    setIngredients((prev) => [...prev, value]);
    setInput('');
  }

  function removeIngredient(value: string) {
    setIngredients((prev) => prev.filter((i) => i !== value));
  }

  async function search() {
    if (!ingredients.length) return;
    setLoading(true);
    try {
      const res = await fetch('/api/recipes/by-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 safe-top">
      <h1 className="mb-1 text-2xl font-bold tracking-tight">¿Qué puedo cocinar?</h1>
      <p className="mb-5 text-sm text-muted-foreground">Contanos qué tenés en casa y te mostramos qué podés hacer.</p>

      <div className="mb-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
          placeholder="Ej: pollo, arroz, cebolla..."
        />
        <Button type="button" size="icon" onClick={addIngredient} aria-label="Agregar ingrediente">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {ingredients.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {ingredients.map((ingredient) => (
            <span key={ingredient} className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              {ingredient}
              <button onClick={() => removeIngredient(ingredient)} aria-label={`Quitar ${ingredient}`}>
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <Button className="mb-8 w-full" size="lg" onClick={search} disabled={!ingredients.length || loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Buscar recetas
      </Button>

      {results && (
        <div className="space-y-8">
          {GROUPS.map((group) => {
            const items = results.filter((r) => r.missing_ingredients === group.key);
            if (!items.length) return null;
            return (
              <section key={group.key}>
                <h2 className="mb-3 text-base font-bold">{group.label}</h2>
                <div className="grid grid-cols-2 gap-3">
                  {items.map(({ recipe }) => (
                    <Link key={recipe.id} href={`/recipe/${recipe.slug}`}>
                      <RecipeCover src={recipe.cover_image_url} alt={recipe.title} seed={recipe.id} className="aspect-square rounded-xl" />
                      <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-snug">{recipe.title}</p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
          {results.length === 0 && <EmptyState emoji="🤔" title="No encontramos recetas con esos ingredientes" description="Probá agregar más ingredientes." />}
        </div>
      )}
    </div>
  );
}
