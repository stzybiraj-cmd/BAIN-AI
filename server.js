// Zero-dependency local dev server: static files + the same /api handlers Vercel runs.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
try {
  for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split('\n')) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch {}

const STATIC = { '/': 'index.html', '/index.html': 'index.html', '/styles.css': 'styles.css', '/app.js': 'app.js', '/tools-config.js': 'tools-config.js' };
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
const API = new Set(['chat', 'tool', 'health']);

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const m = /^\/api\/(\w+)$/.exec(url.pathname);
  if (m && API.has(m[1])) {
    let raw = '';
    for await (const c of req) { raw += c; if (raw.length > 200000) break; }
    try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
    res.status = c => { res.statusCode = c; return res; };
    res.json = o => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(o)); };
    const mod = await import(pathToFileURL(path.join(root, 'api', `${m[1]}.js`)).href);
    return mod.default(req, res);
  }
  const file = STATIC[url.pathname];
  if (!file) { res.statusCode = 404; return res.end('Not found'); }
  res.setHeader('content-type', TYPES[path.extname(file)] + '; charset=utf-8');
  fs.createReadStream(path.join(root, file)).pipe(res);
}).listen(process.env.PORT || 3000, () => console.log(`BAIN AI running at http://localhost:${process.env.PORT || 3000}`));
