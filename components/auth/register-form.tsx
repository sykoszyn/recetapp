'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/features/auth/schemas';
import { signUpAction } from '@/features/auth/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);
    const result = await signUpAction(values);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setSubmitted(values.email);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-soft animate-scale-in">
        <p className="text-3xl">📬</p>
        <p className="mt-3 font-medium">¡Ya casi! Te enviamos un email a</p>
        <p className="font-semibold text-primary">{submitted}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Confirmá tu cuenta desde ese correo para empezar a usar RecetApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input id="full_name" placeholder="Martina Gómez" {...register('full_name')} />
        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username">Nombre de usuario</Label>
        <Input id="username" placeholder="martina.cocina" {...register('username')} autoCapitalize="none" />
        {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="tu@email.com" {...register('email')} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Crear cuenta
      </Button>
    </form>
  );
}
