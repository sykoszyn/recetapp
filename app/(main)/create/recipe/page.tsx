import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listCategories } from '@/services/categories';
import { RecipeWizard } from '@/components/create-recipe/recipe-wizard';

export default async function CreateRecipePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const categories = await listCategories(supabase);

  return <RecipeWizard userId={user.id} categories={categories} />;
}
