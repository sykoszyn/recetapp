import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getProfileByUsername, listFollowing } from '@/services/profiles';

export async function GET(_request: Request, { params }: { params: { username: string } }) {
  const supabase = createClient();
  const profile = await getProfileByUsername(supabase, params.username);
  if (!profile) return NextResponse.json({ items: [] }, { status: 404 });
  const items = await listFollowing(supabase, profile.id);
  return NextResponse.json({ items });
}
