import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { RegisterForm } from '@/components/auth/register-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { Separator } from '@/components/ui/separator';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Creá tu cuenta"
      subtitle="Descubrí, cociná y compartí tus recetas"
      footer={
        <>
          ¿Ya tenés cuenta?{' '}
          <Link href="/login" className="font-semibold text-primary">
            Iniciá sesión
          </Link>
        </>
      }
    >
      <RegisterForm />
      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">o continuá con</span>
        <Separator className="flex-1" />
      </div>
      <OAuthButtons next="/onboarding" />
    </AuthShell>
  );
}
