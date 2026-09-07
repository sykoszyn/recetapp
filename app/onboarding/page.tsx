import { createClient } from '@/lib/supabase/server';
import { listCategories } from '@/services/categories';
import { OnboardingForm } from '@/components/onboarding/onboarding-form';

export default async function OnboardingPage() {
  const supabase = createClient();
  const categories = await listCategories(supabase);

  return <OnboardingForm categories={categories} />;
}
