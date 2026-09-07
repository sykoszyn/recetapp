'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { RecipeGrid } from '@/components/profile/recipe-grid';
import { UserCard } from './user-card';
import { EmptyState } from '@/components/empty-state';
import type { CategoryRow } from '@/types/database';
import type { RecipeCardData } from '@/types';

interface SearchResults {
  recipes: RecipeCardData[];
  users: { id: string; username: string; full_name: string; avatar_url: string | null; followers_count: number }[];
  categories: CategoryRow[];
}

export function ExploreView({
  categories,
  trending,
  fresh,
  popularUsers,
}: {
  categories: CategoryRow[];
  trending: RecipeCardData[];
  fresh: RecipeCardData[];
  popularUsers: { id: string; username: string; full_name: string; avatar_url: string | null; followers_count: number }[];
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(await res.json());
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 safe-top">
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar recetas, ingredientes, usuarios..."
          className="pl-10 pr-10"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2" aria-label="Limpiar búsqueda">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      <Link
        href="/explore/what-can-i-cook"
        className="mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-accent p-4 text-primary-foreground shadow-soft"
      >
        <span className="text-3xl">🥘</span>
        <div>
          <p className="font-bold">¿Qué puedo cocinar?</p>
          <p className="text-sm opacity-90">Decinos qué tenés en tu heladera</p>
        </div>
      </Link>

      {query.trim().length >= 2 ? (
        <div>
          {loading && <p className="text-sm text-muted-foreground">Buscando...</p>}
          {!loading && results && (
            <div className="space-y-8">
              {results.users.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-bold">Usuarios</h2>
                  <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {results.users.map((u) => (
                      <UserCard key={u.id} user={u} />
                    ))}
                  </div>
                </section>
              )}
              {results.categories.length > 0 && (
                <section>
                  <h2 className="mb-3 text-lg font-bold">Categorías</h2>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map((c) => (
                      <Link key={c.id} href={`/explore?category=${c.slug}`} className="rounded-full border border-border px-3 py-1.5 text-sm">
                        {c.emoji} {c.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
              <section>
                <h2 className="mb-3 text-lg font-bold">Recetas</h2>
                {results.recipes.length === 0 ? (
                  <EmptyState emoji="🔍" title="No encontramos resultados" />
                ) : (
                  <RecipeGrid recipes={results.recipes} emptyTitle="" />
                )}
              </section>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-bold">Categorías</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link key={c.id} href={`/explore?category=${c.slug}`} className="rounded-full border border-border px-3 py-1.5 text-sm font-medium">
                  {c.emoji} {c.name}
                </Link>
              ))}
            </div>
          </section>

          {popularUsers.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-bold">Usuarios populares</h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar">
                {popularUsers.map((u) => (
                  <UserCard key={u.id} user={u} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-bold">Tendencias</h2>
            <RecipeGrid recipes={trending} emptyTitle="Todavía no hay recetas populares" />
          </section>

          <section>
            <h2 className="mb-3 text-lg font-bold">Recetas nuevas</h2>
            <RecipeGrid recipes={fresh} emptyTitle="Todavía no hay recetas nuevas" />
          </section>
        </div>
      )}
    </div>
  );
}
