import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public';
import { siteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/explore`, changeFrequency: 'daily', priority: 0.8 },
  ];

  try {
    const supabase = createPublicClient();
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(1000);
    if (error) throw error;

    const recipeRoutes: MetadataRoute.Sitemap = (recipes ?? []).map((r) => ({
      url: `${siteUrl}/recipe/${r.slug}`,
      lastModified: r.updated_at,
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...recipeRoutes];
  } catch {
    // Si la base todavía no tiene el schema corrido, o falla la red en
    // build time, el sitemap no debe tirar abajo el deploy entero.
    return staticRoutes;
  }
}
