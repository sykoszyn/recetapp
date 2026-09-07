import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listCategories } from '@/services/categories';
import { OnboardingForm } from '@/components/onboarding/onboarding-form';

export default async function OnboardingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const categories = await listCategories(supabase);

  return <OnboardingForm categories={categories} />;
}
