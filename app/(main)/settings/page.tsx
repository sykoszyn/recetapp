import { redirect } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getProfileById } from '@/services/profiles';
import { signOutAction } from '@/features/auth/actions';
import { EditProfileForm } from '@/components/settings/edit-profile-form';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await getProfileById(supabase, user.id);
  if (!profile) redirect('/login');

  return (
    <div className="mx-auto max-w-lg px-4 py-8 safe-top">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Configuración</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Apariencia</h2>
        <ThemeToggle />
      </section>

      <Separator className="mb-8" />

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Editar perfil</h2>
        <EditProfileForm profile={profile} />
      </section>

      <Separator className="mb-6" />

      <form action={signOutAction}>
        <Button type="submit" variant="outline" className="w-full gap-2 text-destructive">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </Button>
      </form>
    </div>
  );
}
