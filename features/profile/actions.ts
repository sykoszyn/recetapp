'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { isUsernameAvailable, updateProfile } from '@/services/profiles';

export interface ProfileUpdateInput {
  full_name: string;
  username: string;
  bio: string;
  website: string;
  avatar_url: string | null;
}

export async function updateProfileAction(input: ProfileUpdateInput): Promise<{ error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesión expirada.' };

  if (!/^[a-z0-9_.]{3,30}$/.test(input.username)) {
    return { error: 'Usuario inválido: solo minúsculas, números, "." y "_" (3-30 caracteres).' };
  }

  const available = await isUsernameAvailable(supabase, input.username, user.id);
  if (!available) return { error: 'Ese nombre de usuario ya está en uso.' };

  await updateProfile(supabase, user.id, {
    full_name: input.full_name,
    username: input.username,
    bio: input.bio,
    website: input.website || null,
    avatar_url: input.avatar_url,
  });

  revalidatePath('/settings');
  revalidatePath(`/user/${input.username}`);
  return {};
}
