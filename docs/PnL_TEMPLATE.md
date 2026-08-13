# LocalBoost — P&L Template (XPRIZE submission)

> Per the hackathon requirements, this template discloses **revenue**, **all expenses**, and
> **total marketing & customer acquisition spend** during the hackathon window.
> A live copy of these numbers is tracked in `server/data/localboost.db` (invoices, metrics_history).

## Assumptions to fill in

- Subscription price per client: **$499/mo**
- Inference cost per client per month (Gemini API, all agents): ~**$0.40–$1.20**
- Hosting: single Node.js + SQLite server (estimate below)

## Monthly P&L — template

| Line item | Formula | Month 1 | Month 2 | Month 3 |
|-----------|---------|---------|---------|---------|
| **Revenue** | | | | |
| New client subscriptions | clients × $499 | | | |
| Existing client renewals | clients × $499 | | | |
| **Total revenue (A)** | | | | |
| **Cost of revenue** | | | | |
| Gemini inference | active clients × avg | | | |
| Hosting (Compute + storage) | fixed | | | |
| **Gross margin (A − B)** | | | | |
| **Marketing & customer acquisition** | | | | |
| Ads / paid acquisition | disclose even if $0 | | | |
| Outreach & sales tools | disclose even if $0 | | | |
| **Total marketing spend (C)** | | | | |
| **Net P&L (A − B − C)** | | | | |

## What we disclose

- **Marketing spend:** all spend on marketing and customer acquisition during the hackathon period
  is itemized above, including $0 lines if nothing was spent in a category.
- **Corporate ID:** provided in the submission form (if available).
- **Revenue evidence:** Stripe/merchant dashboard export or bank statement + invoice list from the
  BillingAgent (see Live Dashboard → Invoices).
- **Expense evidence:** Gemini API usage records and hosting invoices.

## Product / agent evidence referenced by the P&L

1. **Agent execution logs** — `agent_events` table, live-streamed in the Agent Console.
2. **API usage records** — Gemini API usage for the window.
3. **Dashboard screenshots** — KPI cards, revenue chart, invoice status, weekly reports.
4. **Customer evidence** — business names, contacts, and testimonials collected during onboarding.
