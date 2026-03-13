# CoParent Compass — Vercel Deployment Guide

## Project Structure

```
coparent-compass/
├── index.html          ← The main app (no API key here)
├── api/
│   └── claude.js       ← Vercel serverless function (reads key server-side)
├── vercel.json         ← Vercel routing config
├── .env.example        ← Template for environment variable
└── README.md
```

---

## Setting Up the API Key in Vercel

The API key is **never** in the HTML or JavaScript. It lives only in Vercel's
environment variables, injected server-side by `api/claude.js`.

### Step 1 — Add the environment variable in Vercel

1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `Coparent_Comp_Key`
   - **Value:** your Anthropic API key (starts with `sk-ant-...`)
   - **Environments:** Production, Preview, Development (check all three)
4. Click **Save**

### Step 2 — Deploy

Push your project to GitHub (or drag-and-drop the folder into Vercel).
Vercel will auto-detect the `api/` folder and deploy `claude.js` as a
serverless function.

### Step 3 — Local development (optional)

To run locally:
1. Copy `.env.example` to `.env.local`
2. Add your actual API key to `.env.local`
3. Install Vercel CLI: `npm i -g vercel`
4. Run: `vercel dev`

---

## How the Security Works

```
Browser (index.html)
    │
    │  POST /api/claude  ← no API key, just the message payload
    ▼
Vercel Serverless Function (api/claude.js)
    │
    │  reads ANTHROPIC_API_KEY from environment (server-side only)
    │  adds x-api-key header
    ▼
Anthropic API
```

The key never touches the browser. DevTools → Network will only show
requests to `/api/claude` on your own domain — the Anthropic key is
never visible.

---

## Environment Variable Name

| Variable Name        | Where to get it                          |
|----------------------|------------------------------------------|
| `Coparent_Comp_Key`  | console.anthropic.com → API Keys section |

The key format looks like: `sk-ant-api03-...`
