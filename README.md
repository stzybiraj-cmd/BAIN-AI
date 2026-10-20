# BAIN AI — Stage 1

Your Vision. Powered by Intelligence.

**Included in this stage:** responsive landing page, working AI chat (with device-local history, copy, delete, new chat), and all 8 AI tools, backed by a secure server-side API route.
**Coming in later stages:** user accounts (Supabase), synced chat history, saved responses, dashboard, light/dark preferences.

## Run locally (Node 18+, no dependencies)
1. `cp .env.example .env` and paste your key: `ANTHROPIC_API_KEY=...` (get one at console.anthropic.com)
2. `npm run dev`
3. Open http://localhost:3000

Without a key the app still loads, but chat and tools show a setup message instead of answers.

## Deploy (Vercel)
1. Push this folder to GitHub and import it in Vercel (no build step).
2. Add `ANTHROPIC_API_KEY` under Project → Settings → Environment Variables.
3. Redeploy. The `/api` folder runs as serverless functions, so the key stays on the server.

## Structure
- `index.html`, `styles.css`, `app.js` — frontend (vanilla JS modules)
- `tools-config.js` — tool forms, shared by browser and server
- `api/chat.js`, `api/tool.js`, `api/health.js` — server routes; `api/_tools.js` holds the tool prompts
- `server.js` — local dev server

## Notes
- Static-only hosting (GitHub Pages, etc.) won't work: the chat needs the `/api` backend.
- Chat history lives in this browser's localStorage until accounts arrive in Stage 3.
