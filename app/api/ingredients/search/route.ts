import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ items: [] });

  const supabase = createClient();
  const { data, error } = await supabase.from('ingredients').select('id, name').ilike('name', `%${q}%`).limit(8);
  if (error) return NextResponse.json({ items: [] }, { status: 500 });
  return NextResponse.json({ items: data });
}
