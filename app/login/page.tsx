import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { LoginForm } from '@/components/auth/login-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { Separator } from '@/components/ui/separator';

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return (
    <AuthShell
      title="Bienvenido de nuevo"
      subtitle="Iniciá sesión para seguir cocinando"
      footer={
        <>
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="font-semibold text-primary">
            Creá una
          </Link>
        </>
      }
    >
      <LoginForm next={searchParams.next} />
      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">o continuá con</span>
        <Separator className="flex-1" />
      </div>
      <OAuthButtons next={searchParams.next} />
    </AuthShell>
  );
}
