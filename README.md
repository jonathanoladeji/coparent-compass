# CoParent Compass — Vercel Deployment Guide

## Project Structure

```
coparent-compass/
├── index.html          ← Full app: calculator, alienation shield, AI advisor
├── api/
│   └── claude.js       ← Vercel serverless proxy (reads API key server-side)
├── vercel.json         ← Vercel routing + function config (60s timeout)
├── package.json        ← Declares CommonJS (no "type":"module")
├── .env.example        ← Template for local development
└── README.md
```

---

## Features

- **Support Calculator** — live web research for child costs specific to your city and country
- **Age-appropriate logic** — infants/toddlers correctly exclude recreation, formal daycare, transport etc.
- **Societal context** — African/Asian extended family norms, public healthcare, public school costs factored in
- **Father's cost of living** — disposable income calculated after personal expenses; shows % of gross AND disposable income
- **Alienation Shield** — 5 practical strategies for high-conflict co-parenting
- **AI Advisor** — conversational support for co-parenting challenges

---

## Setting Up the API Key in Vercel

The API key is **never** in the HTML or any file in the repo. It lives only in
Vercel's environment variables, read server-side by `api/claude.js`.

### Step 1 — Add the environment variable in Vercel

1. Go to your project on [vercel.com](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name:** `Coparent_Comp_Key`
   - **Value:** your Anthropic API key (starts with `sk-ant-...`)
   - **Environments:** Production, Preview, Development (check all three)
4. Click **Save**
5. **Redeploy** — env variables only take effect on the next deployment

### Step 2 — Deploy

Push to GitHub. Vercel auto-detects the `api/` folder and deploys
`claude.js` as a serverless function. `index.html` is served as a static file.
No build step or framework configuration needed.

### Step 3 — Local development (optional)

1. Copy `.env.example` to `.env.local`
2. Add your actual API key to `.env.local`
3. Install Vercel CLI: `npm i -g vercel`
4. Run: `vercel dev`

---

## How the Security Works

```
Browser (index.html)
    │
    │  POST /api/claude  ← message payload only, no API key
    ▼
Vercel Serverless Function (api/claude.js)
    │
    │  reads Coparent_Comp_Key from environment (server-side only)
    │  adds x-api-key header to Anthropic request
    ▼
Anthropic API
```

The key never touches the browser. DevTools → Network only shows
requests to `/api/claude` on your own domain — never the Anthropic key.

---

## Environment Variable

| Variable Name       | Where to get it                           |
|---------------------|-------------------------------------------|
| `Coparent_Comp_Key` | console.anthropic.com → API Keys section  |

Key format: `sk-ant-api03-...`

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `API key not configured` | Env variable missing or wrong name | Check Settings → Environment Variables, redeploy |
| `API error 504` | Request timed out | Already set to 60s in vercel.json; check Vercel plan limits |
| `API error 405` | Function not compiled correctly | Ensure package.json has no `"type":"module"` |
| ESM warning in build log | Harmless — Vercel auto-converts | Ignore or verify claude.js uses `module.exports` |
