 import { NextResponse } from 'next/server';

export async function POST(request) {
  const { messages } = await request.json();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: `You are a friendly English tutor for absolute beginners (A1 level).
Rules:
- Always respond in simple short English, max 3 sentences.
- If the user makes a grammar or spelling mistake, note it using format: CORRECTION: [correction]
- Introduce ONE new word per message using format: NEW_WORD: [word] - [simple definition]
- Be warm and encouraging.`,
      messages
    })
  });

  const data = await response.json();
  return NextResponse.json({ reply: data.content[0].text });
}
