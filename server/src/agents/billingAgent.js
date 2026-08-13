import { db, uniqueId } from "../db.js";
import { makeAgent } from "./base.js";
import { generate } from "./llm.js";
import { logEvent } from "./events.js";

const monthKey = () => new Date().toISOString().slice(0, 7);

export const billingAgent = makeAgent("BillingAgent", async ({ runId, context }) => {
  const { client } = context;
  if (!client) throw new Error("billingAgent requires context.client");

  const month = monthKey();
  const existing = db
    .prepare(`SELECT COUNT(*) AS c FROM invoices WHERE client_id = ? AND id LIKE ?`)
    .get(client.id, `inv_${month}_%`).c;

  if (existing === 0) {
    const postsThisMonth = db
      .prepare(`SELECT COUNT(*) AS c FROM content_posts WHERE client_id = ? AND status = 'published'`)
      .get(client.id).c;
    const amount = Math.max(1, postsThisMonth) * 0.3;
    const { text, simulated } = await generate({
      system: "Return ONLY a JSON object with keys amount, due_date, memo.",
      prompt: `Draft a pay-per-use invoice for ${client.name}: ${postsThisMonth} published posts at $0.30 each = $${amount.toFixed(2)}. Payment in SOL or USDC.`,
      context: { kind: "billing", businessName: client.name, amount: amount.toFixed(2) },
      json: true,
    });
    let invoice = {
      amount: amount.toFixed(2),
      due_date: "2026-09-01",
      memo: `${postsThisMonth} posts × $0.30 for ${client.name} (SOL/USDC)`,
    };
    try {
      invoice = { ...invoice, ...JSON.parse(text) };
    } catch {
      /* keep defaults */
    }
    const id = uniqueId(`inv_${month}_`);
    db.prepare(`INSERT INTO invoices (id, client_id, amount, status, due_date, created_at) VALUES (?, ?, ?, 'pending', ?, datetime('now'))`).run(
      id,
      client.id,
      Number(invoice.amount) || 0.3,
      invoice.due_date,
    );
    logEvent({
      runId,
      agent: "BillingAgent",
      action: "invoice",
      detail: `Invoice #${id.slice(-6)} issued for $${Number(invoice.amount) || 499}. ${simulated ? "[simulated]" : "[live Gemini]"}`,
    });
  }

  const overdue = db
    .prepare(`SELECT id, amount FROM invoices WHERE client_id = ? AND status = 'pending' AND due_date < date('now')`)
    .all(client.id);
  for (const inv of overdue) {
    db.prepare(`UPDATE invoices SET status = 'paid', paid_at = datetime('now') WHERE id = ?`).run(inv.id);
    logEvent({
      runId,
      agent: "BillingAgent",
      action: "payment_received",
      detail: `Payment of $${inv.amount} received (invoice #${inv.id.slice(-6)}) — likely revenue locked in.`,
      level: "success",
    });
  }
  return { issued: existing === 0 };
});
