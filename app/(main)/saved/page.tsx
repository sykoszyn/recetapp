import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listCollections, listSavedRecipes } from '@/services/collections';
import { SavedView } from '@/components/saved/saved-view';

export default async function SavedPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [recipes, collections] = await Promise.all([listSavedRecipes(supabase, user.id), listCollections(supabase, user.id)]);

  return <SavedView initialRecipes={recipes} collections={collections.map((c) => ({ id: c.id, name: c.name }))} />;
}
