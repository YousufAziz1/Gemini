# LocalBoost — The digital agency run entirely by AI agents

> **Build with Gemini XPRIZE · Category: Small Business Services**
> A real business operated by AI agents: content, social, support, analytics and billing run 24/7
> by seven Gemini-powered agents — with no account managers, no project managers, no sales team.

**Live demo:** https://5173-3d8c7bc68c8ac3ff.monkeycode-ai.live

---

## What it is

LocalBoost replaces a $3,000/month marketing agency with a **$499/month subscription operated by AI agents**.
Small businesses that could never afford an agency get a full team anyway: an Orchestrator that plans,
six specialist agents that execute, and a dashboard where humans only review and approve.

Because the business being sold *is* an AI-run business, LocalBoost is **AI-native to the core**:
every "what to post", "who to invoice", and "which customer to help first" decision is executed by
an agent in production, logged, and auditable.

## The agent team

| Agent | Role | Runs autonomously |
|-------|------|-------------------|
| Orchestrator | CEO agent | Sets daily priorities, dispatches tasks, audits results |
| SalesOnboardingAgent | Sales | Qualifies leads, signs clients, drafts 30-day plans |
| ContentAgent | Marketing | Writes platform-native posts for Google/Instagram/Facebook |
| SocialAgent | Publishing | Publishes approved content, tracks engagement |
| SupportAgent | Customer care | Answers customers 24/7 in seconds |
| AnalyticsAgent | Growth | Logs daily KPIs, writes weekly reports + recommendations |
| BillingAgent | Finance | Issues invoices, collects payment, confirms revenue |

## Architecture

```
client/   Vite + React + TypeScript + Recharts (Landing, Live Dashboard, Agent Console)
server/   Node.js + Express + node:sqlite
  agents/   orchestrator + 6 specialist agents on a shared event bus
  llm.js    Gemini REST adapter (live) with a full SIMULATION fallback
  events.js  SQLite-backed execution log + Server-Sent-Events broadcast
```

- **Google Cloud:** Gemini API (`gemini-3.6-flash`) via the generative language REST endpoint.
- **Live agent stream:** every agent action is persisted to SQLite and streamed to the dashboard
  over SSE, so the "AI in production" evidence is real-time and auditable.
- **Simulation mode:** if no API key is present, a deterministic simulation engine keeps the full
  product demoable; the moment `USER_GEMINI_API_KEY` is set, agents execute for real and events are
  tagged `[live Gemini]`.

## Run it locally

```bash
npm run install:all

# optional: enable real Gemini (otherwise simulation mode runs)
cp server/.env.example server/.env   # then paste YOUR key into server/.env

npm run dev
# server on :8080, dashboard on :5173 (Vite proxies /api -> :8080)
```

## API surface

| Method | Path | What it does |
|--------|------|--------------|
| GET | `/api/status` | AI engine mode + model |
| GET | `/api/dashboard?client_id=` | KPIs, metrics, reports for one client |
| GET | `/api/events/stream` | SSE stream of every agent execution |
| POST | `/api/agents/run` | Run the full daily operating cycle |
| POST | `/api/agents/task` | Dispatch a single agent task |
| POST | `/api/agents/onboard` | SalesOnboardingAgent signs a new client |
| POST | `/api/tickets` | SupportAgent answers a customer |

## XPRIZE submission pack

- **Written narrative (500–1000 words):** `docs/PITCH.md`
- **Project info doc:** `docs/PROJECT_INFO.md`
- **P&L template (revenue + marketing spend disclosure):** `docs/PnL_TEMPLATE.md`
- **Agent execution evidence:** the `agent_events` table in `server/data/localboost.db` and the
  live Execution Log in the Agent Console
- **Product evidence:** the Live Dashboard (revenue chart, content queue, support chat, invoices,
  weekly reports) is the running product

## Category impact

- **Access:** a business that could never afford an agency now gets one — creating a durable job for
  the owner instead of one for a middleman.
- **Jobs:** by handing operations to agents, one operator runs dozens of client accounts; the revenue
  created stays in neighborhoods and funds real local jobs.
- **AI-native:** the product, the delivery, and the business model are the agent system.
