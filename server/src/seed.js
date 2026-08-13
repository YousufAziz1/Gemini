import { db, uniqueId, isoDay } from "./db.js";

export function seedIfEmpty() {
  const count = db.prepare(`SELECT COUNT(*) AS c FROM clients`).get().c;
  if (count > 0) return { seeded: false, clients: count };

  const demo = db.prepare(`
    INSERT INTO clients (id, name, industry, location, tagline, avatar, mrr, status, onboarded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'SalesOnboardingAgent', datetime('now'))
  `);

  demo.run("cli_bean", "Bloom & Bean Coffee", "Cafe", "Portland, OR", "Where the neighborhood feels like home.", "#0ea5e9", 499);
  demo.run("cli_apex", "Apex Auto Care", "Auto repair", "Denver, CO", "Honest mechanics you can actually trust.", "#f59e0b", 499);

  const clients = db.prepare(`SELECT * FROM clients`).all();

  const posts = [
    ["Bloom & Bean Coffee", "Facebook", "Weekend specials are back! Stop by for a hand-brewed pour-over and a fresh pastry. The neighborhood knows us for quality, and we are not stopping."],
    ["Bloom & Bean Coffee", "Instagram", "Fresh batch out now. Morning ritual, upgraded. #localcoffee #portland"],
    ["Bloom & Bean Coffee", "Google Business", "New menu items this season — come taste what the buzz is about."],
    ["Apex Auto Care", "Facebook", "Transparent pricing, no surprise fees. Book your diagnostic today and drive out with confidence."],
    ["Apex Auto Care", "Google Business", "Rated 4.9 by your neighbors. Here is why we are Denver's go-to shop."],
  ];
  const insertPost = db.prepare(`
    INSERT INTO content_posts (id, client_id, platform, status, text, created_by, engagement, published_at, created_at)
    VALUES (?, ?, ?, ?, ?, 'ContentAgent', ?, datetime('now','-1 day'), datetime('now','-1 day'))
  `);
  for (let i = 0; i < posts.length; i++) {
    const [bizName, platform, text] = posts[i];
    const client = clients.find((c) => c.name === bizName);
    insertPost.run(uniqueId("post"), client.id, platform, i < 3 ? "published" : "draft", text, 12 + i * 7);
  }

  const tickets = [
    ["cli_bean", "Maya R.", "Do you still have the oat milk cold brew available today?"],
    ["cli_apex", "James T.", "How long does a brake pad replacement usually take?"],
  ];
  const insertTicket = db.prepare(`
    INSERT INTO support_tickets (id, client_id, customer, message, agent_response, status, resolved_at, created_at)
    VALUES (?, ?, ?, ?, ?, 'resolved', datetime('now'), datetime('now','-3 hours'))
  `);
  for (const [cid, customer, message] of tickets) {
    insertTicket.run(uniqueId("ticket"), cid, customer, message, "Thanks for reaching out! We will have a full answer shortly — our team is checking inventory right now and will follow up within the hour.");
  }

  const insertInvoice = db.prepare(`
    INSERT INTO invoices (id, client_id, amount, status, due_date, created_at, paid_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
  `);
  insertInvoice.run("inv_" + "202607_" + "bean", "cli_bean", 12.6, "paid", "2026-07-01", "2026-07-02");
  insertInvoice.run("inv_" + "202607_" + "apex", "cli_apex", 9.3, "paid", "2026-07-01", "2026-07-02");
  insertInvoice.run("inv_" + "202608_" + "bean", "cli_bean", 3.0, "pending", "2026-08-01", null);
  insertInvoice.run("inv_" + "202608_" + "apex", "cli_apex", 2.4, "pending", "2026-08-01", null);

  const upsertMetric = db.prepare(`
    INSERT INTO metrics_history (id, client_id, day, metric, value) VALUES (?, ?, ?, ?, ?)
  `);
  for (let d = 13; d >= 0; d--) {
    for (const c of clients) {
      const growth = 1 + (13 - d) * 0.05;
      upsertMetric.run(uniqueId("m"), c.id, isoDay(d), "engagement", Math.round(50 * growth + Math.random() * 20));
      upsertMetric.run(uniqueId("m"), c.id, isoDay(d), "leads", Math.round(3 * growth + Math.random() * 4));
      upsertMetric.run(uniqueId("m"), c.id, isoDay(d), "site_visits", Math.round(900 * growth + Math.random() * 200));
      upsertMetric.run(uniqueId("m"), c.id, isoDay(d), "revenue", Math.round(450 * growth + Math.random() * 40));
    }
  }

  db.prepare(`
    INSERT INTO reports (id, client_id, period, content, created_at)
    VALUES (?, ?, ?, ?, datetime('now','-6 days'))
  `).run(
    uniqueId("report"),
    "cli_bean",
    "Week of last Monday",
    `# Bloom & Bean Coffee — Weekly Performance Report

## Highlights
- Engagement up **12%** week-over-week.
- Best post (Google Business) drove 38 link clicks.
- Support Agent resolved 100% of tickets in under 15 minutes.

## Recommendations
1. Post between 8-10am — engagement peaks then.
2. Run a weekend promotion to convert followers to visits.
3. Reply to the 2 reviews collected this week.

## Goal Check
Pacing ahead of the monthly goal; agent-run campaigns trending toward **$1,480** this month.`,
  );

  const insertEvent = db.prepare(`
    INSERT INTO agent_events (run_id, agent, action, detail, level, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now','-1 day'))
  `);
  insertEvent.run("run_seed_1", "Orchestrator", "cycle_complete", "Seeded demo workspace. Cycle done: Published 3 posts; Created 2 drafts; Resolved 2 tickets.", "success");
  insertEvent.run("run_seed_1", "BillingAgent", "payment_received", "Payment of $12.60 received in USDC (42 posts × $0.30).", "success");
  insertEvent.run("run_seed_1", "AnalyticsAgent", "record", "Logged daily metrics for 2 clients.", "info");

  return { seeded: true, clients: 2 };
}
