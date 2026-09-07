'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createCollection, deleteCollection } from '@/services/collections';

async function requireUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('unauthorized');
  return { supabase, userId: user.id };
}

export async function createCollectionAction(name: string) {
  const { supabase, userId } = await requireUser();
  const collection = await createCollection(supabase, userId, name);
  revalidatePath('/saved');
  return collection;
}

export async function deleteCollectionAction(collectionId: string) {
  const { supabase } = await requireUser();
  await deleteCollection(supabase, collectionId);
  revalidatePath('/saved');
}
