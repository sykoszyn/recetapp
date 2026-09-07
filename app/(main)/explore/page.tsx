import { createClient } from '@/lib/supabase/server';
import { listCategories } from '@/services/categories';
import { listPublishedRecipes } from '@/services/recipes';
import { listPopularProfiles } from '@/services/profiles';
import { ExploreView } from '@/components/explore/explore-view';

export default async function ExplorePage({ searchParams }: { searchParams: { category?: string } }) {
  const supabase = createClient();

  const [categories, trending, fresh, popularUsers] = await Promise.all([
    listCategories(supabase),
    listPublishedRecipes(supabase, { categorySlug: searchParams.category, orderBy: 'popular', limit: 12 }),
    listPublishedRecipes(supabase, { categorySlug: searchParams.category, orderBy: 'recent', limit: 12 }),
    listPopularProfiles(supabase, 10),
  ]);

  return <ExploreView categories={categories} trending={trending} fresh={fresh} popularUsers={popularUsers} />;
}
