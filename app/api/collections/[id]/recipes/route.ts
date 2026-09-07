import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { listSavedRecipes } from '@/services/collections';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });

  const items = await listSavedRecipes(supabase, user.id, params.id);
  return NextResponse.json({ items });
}
