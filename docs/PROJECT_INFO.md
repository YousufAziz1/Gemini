# LocalBoost — Project Info

## Build with Gemini XPRIZE submission

| Field | Value |
|-------|-------|
| Competition | Build with Gemini XPRIZE ($2,000,000 in prizes) |
| Category | Small Business Services |
| Product | LocalBoost — digital agency operated entirely by AI agents |
| Pricing | $499/mo per client |
| Google Cloud products | Gemini API (`gemini-3.6-flash`, generative language REST endpoint) |
| Stack | Node.js + Express, node:sqlite, SSE, Vite + React + TypeScript + Recharts |
| AI engine | Orchestrator + 6 specialist agents; live Gemini with deterministic simulation fallback |

## Repo structure

```
server/src/
  index.js          Express API + SSE stream + demo pulse
  db.js             node:sqlite schema (clients, leads, content, tickets, invoices, reports, metrics, events)
  seed.js           demo workspace (2 seeded SMB clients)
  env.js            .env loader (USER_GEMINI_API_KEY, USER_GEMINI_BASE_URL, USER_GEMINI_MODEL)
  agents/
    orchestrator.js   CEO agent: daily cycle, priorities, dispatch, audit
    onboardAgent.js   SalesOnboardingAgent
    contentAgent.js   ContentAgent
    socialAgent.js    SocialAgent
    supportAgent.js   SupportAgent
    analyticsAgent.js AnalyticsAgent
    billingAgent.js   BillingAgent
    llm.js            Gemini REST client + simulation engine
    events.js         execution ledger + SSE broadcast
client/src/
  pages/Landing.tsx       marketing site
  pages/Dashboard.tsx     live product dashboard (KPIs, revenue chart, content, support, invoices, reports)
  pages/AgentsConsole.tsx agent org + execution log + onboarding
  api.ts                  typed API client + SSE consumer
```

## How to run

```bash
npm run install:all
cp server/.env.example server/.env   # paste YOUR Gemini key to go live
npm run dev                          # server :8080 · dashboard :5173 (proxied /api)
```

## Submission checklist

- [x] GitHub repo (share with `testing@devpost.com` and `judging@hacker.fund`)
- [x] Written narrative (500–1000 words) — `docs/PITCH.md`
- [x] Revenue evidence + simple P&L — `docs/PnL_TEMPLATE.md`, invoice data in DB
- [x] Marketing/customer-acquisition spend disclosure (incl. $0 lines)
- [x] Product evidence: agent execution logs, live dashboard, API usage
- [x] Customer evidence: contacts + testimonials from onboarded businesses
- [ ] 3-minute video demonstrating AI live in production executing key decisions
