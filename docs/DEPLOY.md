# LocalBoost — Deploy Guide

LocalBoost has two parts that must be deployed separately:

| Part     | Stack                          | Host (recommended) | Why                                      |
|----------|--------------------------------|--------------------|------------------------------------------|
| Frontend | Vite + React (static site)     | **Vercel**         | Fast CDN hosting for static builds       |
| Backend  | Node + Express + SQLite + SSE  | **Render / Railway / Fly.io** | Needs a persistent, always-on process (SSE streams + file DB) |

> Vercel serverless functions are stateless and short-lived, so the Node backend
> (SQLite file DB + SSE streaming) cannot live on Vercel alone.

---

## 1) Backend deploy (Render — free tier)

1. Go to <https://render.com> → **New → Web Service** → connect the GitHub repo `YousufAziz1/Gemini`.
2. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (sleeps on inactivity — wakes on first request)
3. Add **Environment Variables** (in Render dashboard → your service → Environment):
   - `PORT=8080`
   - `USER_GEMINI_API_KEY=<your-key>` (optional — without it the demo runs in simulation mode)
   - `CORS_ORIGIN=https://<your-vercel-app>.vercel.app` (optional — default `*`)
4. Deploy. Copy the service URL, e.g. `https://localboost.onrender.com`.

## 2) Frontend deploy (Vercel — free tier)

1. Go to <https://vercel.com> → **Add New… → Project** → import the GitHub repo `YousufAziz1/Gemini`.
2. Vercel auto-reads `vercel.json` at the repo root:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add **Environment Variable** (Project → Settings → Environment Variables):
   - `VITE_API_URL=https://<your-backend-on-render>.onrender.com`
4. Deploy → your app is live at `https://<your-app>.vercel.app`.

## 3) Post-deploy checks

- Open the Vercel URL → the landing page loads.
- Live Dashboard loads data from the Render backend (check DevTools Network tab for `/api/status` — must be 200).
- Set `LOCALBOOST_PULSE=false` on Render to stop the demo auto-ticket pulse.

## Local dev (unchanged)

- `npm run dev` at repo root starts the Vite dev server (`:5173`) + API server (`:8080`).
- Dev proxy in `client/vite.config.ts` forwards `/api` → `localhost:8080`.
- In production the frontend uses `VITE_API_URL` instead of the proxy.
