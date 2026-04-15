 import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getStartOfWeek() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function GET() {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { data: convos } = await supabase
    .from('conversations')
    .select('words_introduced')
    .gte('created_at', getStartOfWeek());

  const { data: quizzes } = await supabase
    .from('quiz_results')
    .select('score, total')
    .gte('created_at', getStartOfWeek());

  const allWords = [...new Set((convos || []).flatMap(c => c.words_introduced || []))];
  const avgScore = quizzes?.length
    ? Math.round(quizzes.reduce((a, b) => a + b.score / b.total, 0) / quizzes.length * 100)
    : 0;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Create a weekly English worksheet for a beginner who learned: ${allWords.join(', ') || 'basic vocabulary'}. Quiz average: ${avgScore}%.
Return ONLY JSON: {"words":[{"word":"","definition":""}],"fillBlanks":[""],"reading":"","questions":[""],"encouragement":""}`
      }]
    })
  });

  const data = await response.json();
  const worksheet = JSON.parse(data.content[0].text.replace(/```json|```/g, '').trim());
  return NextResponse.json({ worksheet, words: allWords, score: avgScore });
}
