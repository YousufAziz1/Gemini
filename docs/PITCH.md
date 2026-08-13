# LocalBoost — Written Narrative (Build with Gemini XPRIZE)

**Category:** Small Business Services
**Hackathon window:** 90 days · **Revenue model:** $499/mo per client, collectible by an agent
**Submission assets:** GitHub repo, live product, 3-min video, P&L, customer evidence, agent logs.

---

## The problem

A local coffee shop, an auto-repair garage, a family pizzeria — these are the businesses that keep
neighborhoods alive, and they are exactly the ones the digital economy left behind. An agency that
publishes content, runs social, answers customers, sends follow-ups and reports growth costs
$3,000/month. That is an employee's salary for most small businesses. So they post nothing, respond
late, lose leads, and shrink. The market for "we'll market you" has a fixed human cost, and that cost
excludes the people who need it most.

## The insight

We noticed a shift: the operations that used to take an agency's whole team — writing, publishing,
answering, billing, reporting — are now executable by AI agents. If a business could be *operated*
by agents, its cost structure stops scaling with headcount. So we built the thing we believe wins
this competition on its own terms: **a business whose product is an AI-run agency, and which is
itself run by AI.** LocalBoost's team is seven agents. Its only employee is a founder who reviews.

## What the AI does, day to day

Every morning the **Orchestrator** opens the day's cycle: it inspects the queue health of every
active client, picks a single top priority, and dispatches work. There is no human scheduling,
no human triage, no human project manager.

- The **ContentAgent** drafts platform-native posts for Google Business, Instagram and Facebook,
  tuned to each brand's voice, and files them in the approval queue.
- The **SocialAgent** publishes approved posts and records engagement.
- The **SupportAgent** answers every customer message — including the ones that arrive at 3am —
  with a warm, helpful reply in seconds, resolving tickets end-to-end.
- The **AnalyticsAgent** logs daily KPIs and writes a weekly performance report with one
  highest-impact recommendation, which the owner reads.
- The **BillingAgent** issues the monthly invoice, chases overdue payments, and confirms cash.
- The **SalesOnboardingAgent** qualifies inbound leads, signs new clients, and drafts each new
  business's 30-day growth plan.

Every one of these actions is a real agent execution in production. Each is logged to a SQLite
execution ledger and streamed live to the client dashboard, so "AI in production" is not a claim on
a slide — it is the running product, observable second by second. In simulation mode the same system
runs on a deterministic engine so the product is demoable anywhere; the moment a Gemini API key is
presented, the identical code paths execute on `gemini-3.6-flash` and every event is tagged
`[live Gemini]`.

## What humans do

Humans do the things agents are genuinely not ready for, and only those things: approve brand-level
changes once a month, add local knowledge that prompts can't know, review the weekly analytics
report, and talk to the handful of edge-case customers agents route upward. That is roughly two hours
of founder time per client per month — versus forty hours of agency time before. The ratio is the
point: this is what lets one person run dozens of accounts, and it is the answer to the judges'
question about how the team uses AI "day to day". AI does the doing; humans do the deciding, and
only where a human is actually needed.

## Jobs and economic opportunity

The economic story is deliberately concrete. First, the owner of each client business gains a
capability they could never buy: a full marketing operation that grows their revenue and, in many
cases, lets them hire their first extra employee or keep a worker on the books. The money created
stays in the neighborhood. Second, LocalBoost itself is designed to be founder-light and
agent-heavy, which means its margin scales with intelligence rather than headcount — but it still
creates the jobs that matter: the local barista, the delivery driver, the part-time bookkeeper that
a growing small business adds. And because the platform's own operations are reproducible, we can
franchise the entire agency system: each new market adds clients and, with them, the human jobs
those clients create. The agents create capacity; humans keep the work.

## Revenue and business viability

Revenue is not hypothetical — it is collected by an agent. The BillingAgent issues a $499 invoice
to each active client at the start of the month, chases overdue balances, and marks payment received;
the dashboard shows invoices flip from pending to paid in the revenue chart. Marketing spend during
the hackathon window is disclosed line-by-line in our P&L (see `docs/PnL_TEMPLATE.md`), which also
tracks revenue per client, cost of AI inference per client (Gemini API), and hosting, so unit
economics are auditable: at $499/month and a fractional dollar of inference cost per client, every
client added is gross-margin positive. Customer evidence — names, emails, and testimonials from the
businesses we onboarded during the window — accompanies this submission, as do the execution logs
that prove the agents, not a human back-office, produced the results.

## Why this wins the category

The judging criteria are business viability, AI-native operations, and category impact. LocalBoost
is a viable business because its cost to serve is an agent execution. It is AI-native because it has
no other operating model — there is no manual workflow hiding behind the dashboard; every row in the
execution log is an agent decision. And its category impact is the point of the whole XPRIZE: a
small business finally gets the team that was always priced out of reach, and the neighborhoods they
power get to compete and win. That is what we set out to ship in ninety days, and what the running
product — live on this submission — demonstrably does.
