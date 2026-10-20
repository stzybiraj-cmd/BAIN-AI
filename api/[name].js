import { TOOLS } from '../tools-config.js';

const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
const BASE = 'You are a tool inside BAIN AI. Produce only the finished result, no preamble. Use Markdown where it helps.';
const PROMPTS = {
  'content-writer': BASE + ' You are an expert copywriter.',
  'summarizer': BASE + ' Summarize faithfully; add nothing that is not in the text.',
  'code-explainer': BASE + ' Explain what the code does step by step and note bugs or risks.',
  'website-ideas': BASE + ' Give 5 distinct website concepts: name, idea, key sections, one standout feature.',
  'html-css-helper': BASE + ' You are a front-end expert. Return working, accessible, responsive code in fenced blocks, then a short explanation.',
  'study-assistant': BASE + ' You are a patient tutor. For quizzes, put answers after all questions.',
  'caption-generator': BASE + ' Write 3 caption options for the platform and tone.',
  'prompt-generator': BASE + ' Write a clear structured prompt (role, context, task, constraints, output format).',
};
const CHAT_SYSTEM = 'You are BAIN AI, a capable, concise assistant. Answer clearly and honestly. Use Markdown when it helps.';

async function ask(system, messages, max) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: max, system, messages }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(d?.error?.message || 'upstream'), { status: r.status });
  return (d.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
}

function buildTool(id, inputs) {
  const tool = TOOLS.find(t => t.id === id);
  if (!tool || !inputs || typeof inputs !== 'object') return { error: 'Unknown tool or missing inputs.' };
  const lines = [];
  for (const f of tool.fields) {
    const v = typeof inputs[f.name] === 'string' ? inputs[f.name].trim() : '';
    if (!v) { if (f.required) return { error: f.label + ' is required.' }; continue; }
    if (v.length > (f.max || 4000)) return { error: f.label + ' is too long.' };
    if (f.type === 'select' && !f.options.includes(v)) return { error: 'Invalid choice for ' + f.label + '.' };
    lines.push(f.label + ': ' + v);
  }
  return { system: PROMPTS[id], messages: [{ role: 'user', content: lines.join('\n\n') }] };
}

export default async function handler(req, res) {
  const name = req.query?.name;
  if (name === 'health') return res.status(200).json({ configured: Boolean(KEY) });
  if (name !== 'chat' && name !== 'tool') return res.status(404).json({ error: 'not_found', message: 'Unknown route.' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'method', message: 'Use POST.' });
  if (!KEY) return res.status(503).json({ error: 'not_configured', message: 'ANTHROPIC_API_KEY is not set on the server.' });
  try {
    if (name === 'chat') {
      const m = req.body?.messages;
      const ok = Array.isArray(m) && m.length > 0 && m.length <= 40 && m.at(-1).role === 'user' &&
        m.every(x => (x.role === 'user' || x.role === 'assistant') && typeof x.content === 'string' && x.content && x.content.length <= 20000);
      if (!ok) return res.status(400).json({ error: 'bad_request', message: 'Invalid message list.' });
      const reply = await ask(CHAT_SYSTEM, m.map(({ role, content }) => ({ role, content })), 1800);
      return res.status(200).json({ reply });
    }
    const b = buildTool(req.body?.tool, req.body?.inputs);
    if (b.error) return res.status(400).json({ error: 'bad_request', message: b.error });
    return res.status(200).json({ output: await ask(b.system, b.messages, 2500) });
  } catch (e) {
    const message = e.status === 401 ? 'The API key was rejected. Check ANTHROPIC_API_KEY.'
      : e.status === 429 ? 'The AI service is busy. Try again in a moment.'
      : 'The AI service could not complete the request. Try again.';
    return res.status(502).json({ error: 'upstream_error', message });
  }
}
