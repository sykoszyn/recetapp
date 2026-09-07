import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { searchAll } from '@/services/search';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') ?? '';
  const supabase = createClient();
  const results = await searchAll(supabase, q);
  return NextResponse.json(results);
}
