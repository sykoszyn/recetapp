import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PostComposer } from '@/components/create-post/post-composer';

export default async function CreatePostPage({ searchParams }: { searchParams: { recipe?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let initialRecipe = null;
  if (searchParams.recipe) {
    const { data } = await supabase
      .from('recipes')
      .select('id, title, slug, cover_image_url')
      .eq('id', searchParams.recipe)
      .maybeSingle();
    initialRecipe = data ?? null;
  }

  return <PostComposer userId={user.id} initialRecipe={initialRecipe} />;
}
