import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findRecipesByIngredients } from '@/services/recipes';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const ingredients = Array.isArray(body?.ingredients) ? body.ingredients.filter((i: unknown) => typeof i === 'string') : [];

  const supabase = createClient();
  const results = await findRecipesByIngredients(supabase, ingredients);
  return NextResponse.json({ results });
}
