 import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { worksheet, words, score } = await request.json();

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: process.env.STUDENT_EMAIL,
    subject: `📚 Your English Worksheet This Week!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:2rem;">
        <h1 style="font-size:22px;">Your English Worksheet 📚</h1>
        <p style="color:#666;">Quiz score: <strong>${score}%</strong> · Words learned: <strong>${words.length}</strong></p>

        <h2 style="font-size:16px;margin-top:2rem;">Words this week</h2>
        <p>${words.join(' · ') || 'Keep practising!'}</p>

        <h2 style="font-size:16px;margin-top:2rem;">Fill in the blank</h2>
        ${worksheet.fillBlanks.map((s, i) => `<p>${i + 1}. ${s}</p>`).join('')}

        <h2 style="font-size:16px;margin-top:2rem;">Reading</h2>
        <p style="background:#f5f5f5;padding:1rem;border-radius:8px;">${worksheet.reading}</p>

        <h2 style="font-size:16px;margin-top:2rem;">Questions</h2>
        ${worksheet.questions.map((q, i) => `<p>${i + 1}. ${q}</p>`).join('')}

        <p style="margin-top:2rem;padding:1rem;background:#E1F5EE;border-radius:8px;color:#0F6E56;">
          🌟 ${worksheet.encouragement}
        </p>
      </div>
    `
  });

  return NextResponse.json({ ok: true });
}
