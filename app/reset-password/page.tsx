import { AuthShell } from '@/components/auth/auth-shell';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Elegí una nueva contraseña" subtitle="Usala para volver a iniciar sesión">
      <ResetPasswordForm />
    </AuthShell>
  );
}
