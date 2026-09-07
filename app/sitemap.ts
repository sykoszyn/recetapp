import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const { data: recipes } = await supabase
    .from('recipes')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(1000);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/explore`, changeFrequency: 'daily', priority: 0.8 },
  ];

  const recipeRoutes: MetadataRoute.Sitemap = (recipes ?? []).map((r) => ({
    url: `${siteUrl}/recipe/${r.slug}`,
    lastModified: r.updated_at,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...recipeRoutes];
}
