'use client';
import { useState } from 'react';

export default function Home() {
  const [tab, setTab] = useState('chat');
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I am your English tutor 👋 What is your name?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = [...messages, userMsg]
      .filter(m => m.role === 'user' || m.role === 'ai')
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }));

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    });
    const data = await res.json();
    const reply = data.reply;
    let text = reply, correction = null, newWord = null;
    const corrMatch = reply.match(/CORRECTION:\s*(.+?)(\n|$)/i);
    const wordMatch = reply.match(/NEW_WORD:\s*(.+?)(\n|$)/i);
    if (corrMatch) { correction = corrMatch[1]; text = text.replace(corrMatch[0], '').trim(); }
    if (wordMatch) { newWord = wordMatch[1]; text = text.replace(wordMatch[0], '').trim(); }
    setMessages(prev => [...prev, { role: 'ai', text, correction, newWord }]);
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>English Tutor 📚</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 24 }}>Week 1 — Beginner</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['chat', 'worksheet'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 20, border: '1px solid #ddd',
            background: tab === t ? '#000' : 'transparent',
            color: tab === t ? '#fff' : '#333', cursor: 'pointer', fontSize: 14
          }}>{t === 'chat' ? '💬 Tutor' : '📄 Worksheet'}</button>
        ))}
      </div>

      {tab === 'chat' && (
        <div>
          <div style={{ height: 380, overflowY: 'auto', border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 12, background: '#fafafa', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ padding: '10px 14px', borderRadius: 16, background: m.role === 'user' ? '#000' : '#fff', color: m.role === 'user' ? '#fff' : '#000', border: m.role === 'ai' ? '1px solid #eee' : 'none', fontSize: 14, lineHeight: 1.5 }}>
                  {m.text}
                </div>
                {m.correction && <div style={{ marginTop: 4, padding: '6px 10px', background: '#fff8e1', borderRadius: 8, fontSize: 12, color: '#856404' }}>💡 {m.correction}</div>}
                {m.newWord && <div style={{ marginTop: 4, padding: '6px 10px', background: '#e8f5e9', borderRadius: 8, fontSize: 12, color: '#2e7d32' }}>📖 New word: {m.newWord}</div>}
              </div>
            ))}
            {loading && <div style={{ alignSelf: 'flex-start', padding: '10px 14px', background: '#fff', border: '1px solid #eee', borderRadius: 16, fontSize: 14, color: '#999' }}>...</div>}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type in English..." style={{ flex: 1, padding: '10px 16px', borderRadius: 24, border: '1px solid #ddd', fontSize: 14, outline: 'none' }} />
            <button onClick={sendMessage} disabled={loading} style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: 24, fontSize: 14, cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      )}

      {tab === 'worksheet' && (
        <WorksheetTab />
      )}
    </main>
  );
}

function WorksheetTab() {
  const [loading, setLoading] = useState(false);
  const [worksheet, setWorksheet] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  async function generate() {
    setLoading(true);
    const res = await fetch('/api/generate-worksheet');
    const data = await res.json();
    setWorksheet(data);
    setLoading(false);
  }

  async function sendEmail() {
    if (!worksheet) return;
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(worksheet)
    });
    setEmailSent(true);
  }

  return (
    <div>
      {!worksheet && !loading && (
        <button onClick={generate} style={{ padding: '12px 24px', background: '#000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
          Generate this week's worksheet
        </button>
      )}
      {loading && <p style={{ color: '#666' }}>Generating worksheet with AI...</p>}
      {worksheet && (
        <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 24 }}>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Weekly Worksheet</h2>
          <h3 style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>WORDS THIS WEEK</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
            {worksheet.worksheet?.words?.map((w, i) => (
              <div key={i} style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 8 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{w.word}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{w.definition}</div>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>FILL IN THE BLANK</h3>
          {worksheet.worksheet?.fillBlanks?.map((s, i) => (
            <p key={i} style={{ fontSize: 14, marginBottom: 8 }}>{i + 1}. {s}</p>
          ))}
          <div style={{ marginTop: 16, padding: 12, background: '#e8f5e9', borderRadius: 8, fontSize: 14, color: '#2e7d32' }}>
            🌟 {worksheet.worksheet?.encouragement}
          </div>
          <button onClick={sendEmail} disabled={emailSent} style={{ marginTop: 16, padding: '10px 24px', background: emailSent ? '#666' : '#000', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>
            {emailSent ? '✓ Email sent!' : '📧 Send to email'}
          </button>
        </div>
      )}
    </div>
  );
}