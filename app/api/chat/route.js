import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
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
    
    if (!data.content || !data.content[0]) {
      console.error('Anthropic error:', JSON.stringify(data));
      return NextResponse.json({ reply: 'Sorry, I had a problem. Please try again!' });
    }

    return NextResponse.json({ reply: data.content[0].text });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ reply: 'Sorry, something went wrong. Please try again!' });
  }
}