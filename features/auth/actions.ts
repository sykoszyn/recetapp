'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from './schemas';

export interface ActionResult {
  error?: string;
  success?: boolean;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.data ? undefined : parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const { full_name, username, email, password } = parsed.data;
  const supabase = createClient();

  const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).maybeSingle();
  if (existing) return { error: 'Ese nombre de usuario ya está en uso.' };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, username },
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/onboarding`,
    },
  });
  if (error) return { error: translateAuthError(error.message) };

  return { success: true };
}

export async function signInAction(input: unknown, next?: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: translateAuthError(error.message) };

  redirect(next && next.startsWith('/') ? next : '/feed');
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });
  if (error) return { error: translateAuthError(error.message) };
  return { success: true };
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: translateAuthError(error.message) };

  redirect('/feed');
}

export async function resendVerificationEmailAction(email: string): Promise<ActionResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${siteUrl}/auth/confirm?next=/onboarding` },
  });
  if (error) return { error: translateAuthError(error.message) };
  return { success: true };
}

function translateAuthError(message: string) {
  const map: Record<string, string> = {
    'Invalid login credentials': 'Email o contraseña incorrectos.',
    'Email not confirmed': 'Confirmá tu email antes de iniciar sesión.',
    'User already registered': 'Ya existe una cuenta con ese email.',
  };
  return map[message] ?? message;
}
