import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getProfileByUsername, isFollowing } from '@/services/profiles';
import { getUserRecipes } from '@/services/recipes';
import { getUserPosts } from '@/services/posts';
import { listSavedRecipes } from '@/services/collections';
import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileTabs } from '@/components/profile/profile-tabs';
import { RecipeGrid } from '@/components/profile/recipe-grid';
import { PostThumbnailGrid } from '@/components/profile/post-thumbnail-grid';

export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  const supabase = createClient();
  const profile = await getProfileByUsername(supabase, params.username);
  if (!profile) return {};
  return {
    title: `@${profile.username}`,
    description: profile.bio || `Perfil de @${profile.username} en RecetApp.`,
    openGraph: { images: profile.avatar_url ? [profile.avatar_url] : undefined },
  };
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const profile = await getProfileByUsername(supabase, params.username);
  if (!profile) notFound();

  const isOwner = user?.id === profile.id;

  const [recipes, posts, saved, following] = await Promise.all([
    getUserRecipes(supabase, profile.id, 'published'),
    getUserPosts(supabase, profile.id, user?.id ?? null),
    isOwner ? listSavedRecipes(supabase, profile.id) : Promise.resolve([]),
    user && !isOwner ? isFollowing(supabase, user.id, profile.id) : Promise.resolve(false),
  ]);

  return (
    <div className="pb-10">
      <ProfileHeader profile={profile} isOwner={isOwner} isFollowing={following} isAuthenticated={!!user} />
      <div className="px-4">
        <ProfileTabs
          recipesPanel={
            <RecipeGrid
              recipes={recipes}
              emptyTitle={isOwner ? 'Todavía no publicaste recetas' : 'Sin recetas publicadas'}
              emptyActionLabel={isOwner ? 'Crear receta' : undefined}
              emptyActionHref={isOwner ? '/create/recipe' : undefined}
            />
          }
          resultsPanel={<PostThumbnailGrid posts={posts} emptyMessage={isOwner ? 'Todavía no compartiste resultados' : 'Sin resultados todavía'} />}
          savedPanel={isOwner ? <RecipeGrid recipes={saved} emptyTitle="No guardaste ninguna receta todavía" emptyActionLabel="Descubrir recetas" emptyActionHref="/explore" /> : undefined}
        />
      </div>
    </div>
  );
}
