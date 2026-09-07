import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listSavedRecipes } from '@/services/collections';
import { getUserRecipes } from '@/services/recipes';
import { getRecentlyCookedRecipeIds } from '@/services/posts';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get('tab') ?? 'saved';

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [] });

  if (tab === 'own') {
    const recipes = await getUserRecipes(supabase, user.id, 'published');
    return NextResponse.json({ items: recipes });
  }

  if (tab === 'recent') {
    const ids = await getRecentlyCookedRecipeIds(supabase, user.id);
    if (!ids.length) return NextResponse.json({ items: [] });
    const { data } = await supabase.from('recipes').select('id, title, slug, cover_image_url').in('id', ids);
    return NextResponse.json({ items: data ?? [] });
  }

  const recipes = await listSavedRecipes(supabase, user.id);
  return NextResponse.json({ items: recipes });
}
