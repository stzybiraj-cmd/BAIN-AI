import { TOOLS } from './tools-config.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const main = $('#main');

/* ---------- utilities ---------- */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.id); toast.id = setTimeout(() => t.classList.remove('show'), 1800);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); }
  catch { toast('Copy failed — select the text and copy it manually'); }
}
// Minimal, safe Markdown: input is escaped first, then a small subset is re-introduced.
function md(src) {
  const blocks = [];
  let t = esc(src).replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, c) => { blocks.push(`<pre><code>${c.replace(/\n$/, '')}</code></pre>`); return `\u0000${blocks.length - 1}\u0000`; });
  t = t.replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  const out = []; let list = null, para = [];
  const flushP = () => { if (para.length) { out.push(`<p>${para.join('<br>')}</p>`); para = []; } };
  const flushL = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const line of t.split('\n')) {
    const ul = /^\s*[-*]\s+(.*)/.exec(line), ol = /^\s*\d+\.\s+(.*)/.exec(line), h = /^#{1,4}\s+(.*)/.exec(line);
    if (ul || ol) { flushP(); const kind = ul ? 'ul' : 'ol'; if (list !== kind) { flushL(); out.push(`<${kind}>`); list = kind; } out.push(`<li>${(ul || ol)[1]}</li>`); }
    else if (h) { flushP(); flushL(); out.push(`<h3>${h[1]}</h3>`); }
    else if (!line.trim()) { flushP(); flushL(); }
    else { flushL(); para.push(line); }
  }
  flushP(); flushL();
  return out.join('').replace(/\u0000(\d+)\u0000/g, (_, i) => blocks[i]).replace(/<p>(<pre>[\s\S]*?<\/pre>)<\/p>/g, '$1');
}
async function api(path, body) {
  let res;
  try {
    res = await fetch(path, { method: body ? 'POST' : 'GET', headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  } catch { throw { kind: 'network', message: 'Could not reach the BAIN AI server. Check your connection, and make sure the app is running with its backend (see README).' }; }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (data?.error === 'not_configured') throw { kind: 'setup', message: data.message };
    if (!data) throw { kind: 'network', message: 'The server returned an unexpected response. If you are hosting only the static files, the /api backend is missing (see README).' };
    throw { kind: 'error', message: data.message || 'Something went wrong. Try again.' };
  }
  return data;
}
const setupHTML = `<div class="notice"><strong>AI is not set up yet.</strong> Add your key as <code>ANTHROPIC_API_KEY</code> on the server (copy <code>.env.example</code> to <code>.env</code> locally, or set it in your host’s environment variables), then restart. See the README for steps.</div>`;
const errHTML = e => e.kind === 'setup' ? setupHTML : `<div class="errbox" role="alert">${esc(e.message)}</div>`;

let configured = null;
async function checkConfigured() {
  try { configured = (await api('/api/health')).configured; } catch { configured = null; }
  return configured;
}

/* ---------- landing ---------- */
const toolCard = t => `<a class="tool-card" href="#/tools/${t.id}"><span class="glyph" aria-hidden="true">${esc(t.glyph)}</span><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p></a>`;

function orbSVG() {
  const pts = [[200, 40], [330, 110], [350, 250], [250, 355], [110, 330], [50, 200], [120, 90]];
  const nodes = pts.map(([x, y]) => `<circle class="node" cx="${x}" cy="${y}" r="5"/>`).join('');
  const links = pts.map(([x, y]) => `<line class="link" x1="200" y1="200" x2="${x}" y2="${y}"/>`).join('');
  return `<svg class="orb" viewBox="0 0 400 400" role="img" aria-label="Animated network of connected nodes around a glowing core">
    <defs><radialGradient id="coreGrad"><stop offset="0" stop-color="#d8c8ff"/><stop offset=".45" stop-color="#8b5cf6"/><stop offset="1" stop-color="#3a1f8f" stop-opacity=".2"/></radialGradient></defs>
    <g class="ring r1"><circle cx="200" cy="200" r="170"/>${nodes}${links}</g>
    <g class="ring r2"><circle cx="200" cy="200" r="120" stroke-dasharray="3 7"/></g>
    <g class="ring r3"><circle cx="200" cy="200" r="75"/></g>
    <circle class="core" cx="200" cy="200" r="42"/></svg>`;
}

function renderLanding(scrollTo) {
  main.innerHTML = `
  <section class="hero"><div class="wrap hero-grid">
    <div class="hero-copy">
      <h1>Meet Your New AI Workspace</h1>
      <p class="lead">BAIN AI brings a chat assistant and eight focused tools into one place, so you can write, summarize, code, study and create without switching apps.</p>
      <div class="cta-row"><a class="btn btn-primary" href="#/chat">Start Chatting</a><a class="btn" href="#/tools">Explore AI Tools</a></div>
      <p class="tagline">Your Vision. Powered by Intelligence.</p>
    </div>
    ${orbSVG()}
  </div></section>
  <section class="block" id="tools"><div class="wrap">
    <div class="sec-head"><div><h2>Featured tools</h2><p>Each tool is built for one job and shows you the result in seconds.</p></div><a class="btn btn-ghost" href="#/tools">See all ${TOOLS.length} tools</a></div>
    <div class="grid-tools">${[TOOLS[0], TOOLS[2], TOOLS[4], TOOLS[5]].map(toolCard).join('')}</div>
  </div></section>
  <section class="block" id="features"><div class="wrap">
    <div class="sec-head"><div><h2>What’s inside</h2></div></div>
    <div class="features">
      <div class="feature"><h3>A chat that answers for real</h3><p>Conversations go through a secure server to a live AI model. Your API key never reaches the browser.</p></div>
      <div class="feature"><h3>Tools with their own forms</h3><p>Pick a tool, fill in a few fields, and get focused output instead of writing a prompt from scratch.</p></div>
      <div class="feature"><h3>Chat history on your device</h3><p>Conversations are kept in this browser so you can pick up where you left off. Accounts and synced history are coming next.</p></div>
      <div class="feature"><h3>Honest by design</h3><p>If something isn’t configured or a request fails, BAIN AI tells you exactly what happened instead of faking a result.</p></div>
    </div>
  </div></section>
  <footer class="footer"><div class="wrap"><span>© ${new Date().getFullYear()} BAIN AI. Your Vision. Powered by Intelligence.</span>
    <nav aria-label="Footer"><a href="#/features">Features</a><a href="#/tools">Tools</a><a href="#/chat">Chat</a></nav></div></footer>`;
  if (scrollTo) requestAnimationFrame(() => document.getElementById(scrollTo)?.scrollIntoView({ behavior: 'smooth' }));
  else window.scrollTo(0, 0);
}

/* ---------- tools ---------- */
function renderTools() {
  main.innerHTML = `<div class="page wrap"><h1>AI Tools</h1><p class="sub">Choose a tool. Each one has its own form and sends your input to the AI through the BAIN AI server.</p><div class="grid-tools">${TOOLS.map(toolCard).join('')}</div></div>`;
  window.scrollTo(0, 0);
}

function fieldHTML(f) {
  const id = `f-${f.name}`, req = f.required ? 'required' : '';
  let control;
  if (f.type === 'select') control = `<select id="${id}" name="${f.name}">${f.options.map(o => `<option>${esc(o)}</option>`).join('')}</select>`;
  else if (f.type === 'textarea') control = `<textarea id="${id}" name="${f.name}" maxlength="${f.max || 4000}" placeholder="${esc(f.placeholder || '')}" ${req} class="${f.mono ? 'mono' : ''}" aria-describedby="${id}-err"></textarea>`;
  else control = `<input id="${id}" name="${f.name}" type="text" maxlength="${f.max || 200}" placeholder="${esc(f.placeholder || '')}" ${req} aria-describedby="${id}-err">`;
  return `<div class="field"><label for="${id}">${esc(f.label)}</label>${control}<div class="field-err" id="${id}-err"></div></div>`;
}

function renderTool(id) {
  const tool = TOOLS.find(t => t.id === id);
  if (!tool) { location.hash = '#/tools'; return; }
  main.innerHTML = `<div class="page wrap"><a class="back" href="#/tools">← All tools</a><h1>${esc(tool.name)}</h1><p class="sub">${esc(tool.desc)}</p>
    <div class="tool-layout">
      <form class="panel" novalidate>${tool.fields.map(fieldHTML).join('')}<button class="btn btn-primary" type="submit" style="width:100%">Generate</button></form>
      <div class="panel" aria-live="polite"><div class="out-head"><h2>Result</h2><button class="chip" id="copy-out" hidden>Copy</button></div><div id="out"><p class="empty">Your result will appear here.</p></div></div>
    </div></div>`;
  window.scrollTo(0, 0);
  const form = $('form'), out = $('#out'), copyBtn = $('#copy-out'), submit = $('button[type=submit]', form);
  let raw = '';
  copyBtn.onclick = () => copyText(raw);
  form.onsubmit = async e => {
    e.preventDefault();
    const inputs = {}; let bad = false;
    for (const f of tool.fields) {
      const el = form.elements[f.name], v = el.value.trim(), err = $(`#f-${f.name}-err`);
      inputs[f.name] = v;
      const missing = f.required && !v;
      el.setAttribute('aria-invalid', missing); err.textContent = missing ? `${f.label} is required.` : '';
      if (missing && !bad) { el.focus(); } bad ||= missing;
    }
    if (bad) return;
    submit.disabled = true; submit.innerHTML = '<span class="spinner"></span> Generating…'; copyBtn.hidden = true;
    out.innerHTML = '<div class="dots" role="status" aria-label="Generating"><i></i><i></i><i></i></div>';
    try {
      raw = (await api('/api/tool', { tool: tool.id, inputs })).output;
      out.innerHTML = `<div class="md">${md(raw)}</div>`; copyBtn.hidden = false;
    } catch (err) { out.innerHTML = errHTML(err); }
    submit.disabled = false; submit.textContent = 'Generate';
  };
}

/* ---------- chat ---------- */
const store = {
  load() { try { return JSON.parse(localStorage.getItem('bain.chats')) || []; } catch { return []; } },
  save(chats) { try { localStorage.setItem('bain.chats', JSON.stringify(chats)); } catch { toast('Could not save history (storage is full or blocked)'); } },
};
const SUGGESTIONS = ['Explain how APIs work in simple terms', 'Help me plan a study schedule for exams', 'Write a friendly email asking for a deadline extension', 'Review this idea: a website for local artists'];
const chatState = { chats: [], id: null, busy: false };
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const current = () => chatState.chats.find(c => c.id === chatState.id);

function renderChat() {
  chatState.chats = store.load().sort((a, b) => b.updated - a.updated);
  if (!current()) chatState.id = null;
  main.innerHTML = `<div class="chat-shell">
    <aside class="side" id="side" aria-label="Chat history"><div class="side-head"><button class="btn btn-primary" id="new" style="width:100%">New chat</button></div><div class="side-title">History</div><div class="side-list" id="hist"></div></aside>
    <div class="scrim" id="scrim"></div>
    <section class="chat-main"><div class="chat-top"><button class="chip hist-toggle" id="hist-toggle" aria-controls="side">History</button><h1 id="title">New chat</h1></div>
      <div id="banner"></div>
      <div class="msgs" id="msgs" role="log" aria-live="polite"><div class="msgs-in" id="msgs-in"></div></div>
      <div class="composer"><div class="composer-in"><textarea id="input" rows="1" maxlength="8000" placeholder="Message BAIN AI…" aria-label="Message"></textarea><button class="btn btn-primary send" id="send" aria-label="Send message"><svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M10 16V4M5 9l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>
      <p class="hint">Enter to send · Shift+Enter for a new line · AI can make mistakes</p></div></section></div>`;
  window.scrollTo(0, 0);
  const side = $('#side'), scrim = $('#scrim'), input = $('#input');
  const toggle = open => { side.classList.toggle('open', open); scrim.classList.toggle('open', open); };
  $('#hist-toggle').onclick = () => toggle(!side.classList.contains('open'));
  scrim.onclick = () => toggle(false);
  $('#new').onclick = () => { chatState.id = null; toggle(false); drawChat(); input.focus(); };
  $('#send').onclick = () => send();
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });
  input.addEventListener('input', () => { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 180) + 'px'; });
  $('#hist').onclick = e => {
    const open = e.target.closest('.open'), del = e.target.closest('.del');
    if (open) { chatState.id = open.dataset.id; toggle(false); drawChat(); }
    if (del && confirm('Delete this chat? This cannot be undone.')) {
      chatState.chats = chatState.chats.filter(c => c.id !== del.dataset.id); store.save(chatState.chats);
      if (chatState.id === del.dataset.id) chatState.id = null; drawChat();
    }
  };
  $('#msgs-in').onclick = e => {
    const c = e.target.closest('[data-copy]'), s = e.target.closest('[data-suggest]'), r = e.target.closest('[data-retry]');
    if (c) copyText(current().messages[+c.dataset.copy].content);
    if (s) { input.value = s.dataset.suggest; input.focus(); }
    if (r) send(true);
  };
  drawChat();
  checkConfigured().then(ok => { if (ok === false) $('#banner').innerHTML = `<div style="padding:12px 18px">${setupHTML}</div>`; });
}

function drawChat(extra = '') {
  const chat = current();
  $('#title').textContent = chat?.title || 'New chat';
  $('#hist').innerHTML = chatState.chats.length ? chatState.chats.map(c => `<div class="hist ${c.id === chatState.id ? 'active' : ''}"><button class="open" data-id="${c.id}" title="${esc(c.title)}">${esc(c.title)}</button><button class="del" data-id="${c.id}" aria-label="Delete chat ${esc(c.title)}"><svg width="15" height="15" viewBox="0 0 20 20" fill="none"><path d="M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div>`).join('') : '<p class="side-title">No chats yet</p>';
  const list = $('#msgs-in');
  if (!chat || !chat.messages.length) {
    list.innerHTML = `<div class="hello"><h2>What are we working on?</h2><p>Ask anything, or start from an idea below.</p><div class="suggest">${SUGGESTIONS.map(s => `<button class="chip" data-suggest="${esc(s)}">${esc(s)}</button>`).join('')}</div></div>${extra}`;
    return;
  }
  list.innerHTML = chat.messages.map((m, i) => m.role === 'user'
    ? `<div class="msg user"><div class="bubble">${esc(m.content)}</div></div>`
    : `<div class="msg assistant"><div class="bubble md">${md(m.content)}</div><div class="msg-tools"><button class="chip" data-copy="${i}">Copy response</button></div></div>`).join('') + extra;
  const box = $('#msgs'); box.scrollTop = box.scrollHeight;
}

async function send(retry = false) {
  if (chatState.busy) return;
  const input = $('#input');
  let chat = current();
  if (!retry) {
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    if (!chat) { chat = { id: uid(), title: text.slice(0, 48), messages: [], updated: Date.now() }; chatState.chats.unshift(chat); chatState.id = chat.id; }
    chat.messages.push({ role: 'user', content: text });
    input.value = ''; input.style.height = 'auto';
  }
  if (!chat || chat.messages.at(-1)?.role !== 'user') return;
  chat.updated = Date.now(); store.save(chatState.chats);
  chatState.busy = true; $('#send').disabled = true;
  drawChat('<div class="msg assistant"><div class="dots" role="status" aria-label="BAIN AI is thinking"><i></i><i></i><i></i></div></div>');
  const box = $('#msgs'); box.scrollTop = box.scrollHeight;
  let extra = '';
  try {
    const { reply } = await api('/api/chat', { messages: chat.messages.slice(-20) });
    chat.messages.push({ role: 'assistant', content: reply }); chat.updated = Date.now(); store.save(chatState.chats);
  } catch (e) {
    extra = `<div class="msg assistant">${errHTML(e)}${e.kind === 'setup' ? '' : '<div class="msg-tools"><button class="chip" data-retry>Try again</button></div>'}</div>`;
  }
  chatState.busy = false; $('#send').disabled = false;
  if (chatState.id === chat.id && $('#msgs-in')) { drawChat(extra); $('#input').focus(); }
}

/* ---------- router ---------- */
function setActive(name) { $$('.nav a[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === name)); }
function route() {
  const parts = (location.hash.slice(1) || '/').split('/').filter(Boolean);
  $('#nav').classList.remove('open'); $('.nav-toggle').setAttribute('aria-expanded', 'false');
  const [a, b] = parts;
  if (!a) { setActive(''); renderLanding(); }
  else if (a === 'features') { setActive('features'); renderLanding('features'); }
  else if (a === 'tools') { setActive('tools'); b ? renderTool(b) : renderTools(); }
  else if (a === 'chat') { setActive('chat'); renderChat(); }
  else { location.hash = '#/'; return; }
  document.title = 'BAIN AI — Your Vision. Powered by Intelligence.';
}
$('.nav-toggle').onclick = e => { const o = $('#nav').classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
addEventListener('hashchange', route);
route();
