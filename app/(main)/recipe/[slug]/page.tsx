import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getRecipeBySlug, getSimilarRecipes, incrementRecipeView } from '@/services/recipes';
import { getRecipeResultPosts } from '@/services/posts';
import { listRecipeReviews, canReviewRecipe } from '@/services/reviews';
import { listComments } from '@/services/comments';
import { isFollowing } from '@/services/profiles';
import { buildRecipeJsonLd } from '@/lib/recipe-schema';
import { RecipeHero } from '@/components/recipe/recipe-hero';
import { IngredientsPanel } from '@/components/recipe/ingredients-panel';
import { StepsSection } from '@/components/recipe/steps-section';
import { ResultsGrid } from '@/components/recipe/results-grid';
import { SimilarRecipes } from '@/components/recipe/similar-recipes';
import { ReviewsSection } from '@/components/recipe/reviews-section';
import { CommentSection } from '@/components/comments/comment-section';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { siteUrl } from '@/lib/site-url';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const recipe = await getRecipeBySlug(supabase, params.slug);
  if (!recipe) return {};

  const description = recipe.description || `Receta de ${recipe.author.username} en RecetApp.`;
  return {
    title: recipe.title,
    description,
    alternates: { canonical: `${siteUrl}/recipe/${recipe.slug}` },
    openGraph: {
      type: 'article',
      title: recipe.title,
      description,
      images: recipe.cover_image_url ? [recipe.cover_image_url] : undefined,
      url: `${siteUrl}/recipe/${recipe.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: recipe.title,
      description,
      images: recipe.cover_image_url ? [recipe.cover_image_url] : undefined,
    },
  };
}

export default async function RecipePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const recipe = await getRecipeBySlug(supabase, params.slug, user?.id ?? null);
  if (!recipe) notFound();

  const isOwner = user?.id === recipe.user_id;

  const [conversionsResult, resultPosts, similarRecipes, reviews, comments, followingAuthor, reviewAllowed] = await Promise.all([
    (async () => {
      const ingredientIds = recipe.ingredients.map((i) => i.ingredient_id).filter((id): id is string => !!id);
      if (!ingredientIds.length) return {};
      const { data } = await supabase.from('ingredient_conversions').select('*').in('ingredient_id', ingredientIds);
      return Object.fromEntries((data ?? []).map((row) => [row.ingredient_id, row]));
    })(),
    getRecipeResultPosts(supabase, recipe.id, user?.id ?? null),
    getSimilarRecipes(supabase, recipe.id, recipe.categories.map((c) => c.id), 8),
    listRecipeReviews(supabase, recipe.id),
    listComments(supabase, { recipeId: recipe.id }, user?.id ?? null),
    user && !isOwner ? isFollowing(supabase, user.id, recipe.user_id) : Promise.resolve(false),
    user ? canReviewRecipe(supabase, user.id, recipe.id) : Promise.resolve(false),
  ]);

  if (!isOwner) await incrementRecipeView(supabase, recipe.id, user?.id ?? null);

  const jsonLd = buildRecipeJsonLd(recipe, siteUrl);

  return (
    <div className="pb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-2xl md:px-4 md:py-6">
        <RecipeHero recipe={recipe} isAuthenticated={!!user} isOwner={isOwner} isFollowingAuthor={followingAuthor} />

        <div className="space-y-8 px-4 md:px-0">
          <Separator />
          <IngredientsPanel ingredients={recipe.ingredients} originalServings={recipe.servings} conversions={conversionsResult} />

          <Separator />
          <StepsSection steps={recipe.steps} videoUrl={recipe.video_url} />

          {recipe.notes && (
            <>
              <Separator />
              <div>
                <h2 className="mb-2 text-lg font-bold">Consejos</h2>
                <p className="text-sm text-muted-foreground">{recipe.notes}</p>
              </div>
            </>
          )}

          <Separator />
          <div className="rounded-2xl bg-muted/60 p-5 text-center">
            <p className="mb-3 font-semibold">¿Ya la hiciste?</p>
            <Button asChild>
              <Link href={`/create/post?recipe=${recipe.id}`}>Ya la hice</Link>
            </Button>
          </div>

          <Separator />
          <ResultsGrid posts={resultPosts} cookedCount={recipe.cooked_count} />

          <Separator />
          <ReviewsSection reviews={reviews} recipeId={recipe.id} recipeSlug={recipe.slug} canReview={reviewAllowed} />

          <Separator />
          <CommentSection target={{ recipeId: recipe.id }} initialComments={comments} currentUserId={user?.id ?? null} />

          <Separator />
          <SimilarRecipes recipes={similarRecipes} />
        </div>
      </div>
    </div>
  );
}
