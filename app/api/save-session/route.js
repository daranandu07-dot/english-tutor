 import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  const { messages, wordsIntroduced } = await request.json();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  await supabase.from('conversations').insert({
    messages,
    words_introduced: wordsIntroduced
  });

  return NextResponse.json({ ok: true });
}
