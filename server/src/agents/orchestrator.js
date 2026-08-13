import { db, uniqueId } from "../db.js";
import { logEvent } from "./events.js";
import { contentAgent } from "./contentAgent.js";
import { socialAgent } from "./socialAgent.js";
import { supportAgent } from "./supportAgent.js";
import { analyticsAgent } from "./analyticsAgent.js";
import { billingAgent } from "./billingAgent.js";
import { isLive, generate } from "./llm.js";

const getClients = db.prepare(`SELECT * FROM clients WHERE status = 'active'`);
const getOpenTickets = db.prepare(`SELECT * FROM support_tickets WHERE status = 'open' LIMIT 5`);

async function decidePriority(runId, clients) {
  logEvent({
    runId,
    agent: "Orchestrator",
    action: "plan",
    detail: `Assessing ${clients.length} active client${clients.length === 1 ? "" : "s"} and queue health to set today's priorities.`,
  });
  if (isLive()) {
    const { text } = await generate({
      system:
        "You are the CEO agent of LocalBoost, an AI-run agency. Pick today's single highest-priority action from: publish_content, generate_content, billing, analytics. Return just the keyword.",
      prompt: "Decide the priority for today's operating cycle.",
      context: { kind: "generic" },
    });
    return text.trim().toLowerCase();
  }
  return "publish_content";
}

export async function runDailyCycle() {
  const runId = uniqueId("run");
  db.prepare(`INSERT INTO runs (id, status, started_at) VALUES (?, 'running', datetime('now'))`).run(runId);

  logEvent({
    runId,
    agent: "Orchestrator",
    action: "cycle_start",
    detail: "Daily operating cycle started. Dispatching agents...",
  });

  const clients = getClients.all();
  if (clients.length === 0) {
    logEvent({ runId, agent: "Orchestrator", action: "error", detail: "No active clients.", level: "error" });
    return { runId, status: "no_clients" };
  }

  const priority = await decidePriority(runId, clients);
  logEvent({
    runId,
    agent: "Orchestrator",
    action: "decision",
    detail: `Priority set: ${priority}.`,
    level: "success",
  });

  const client = clients[0];
  const summary = [];

  const published = await socialAgent({ runId, context: { client } });
  if (published > 0) summary.push(`Published ${published} post(s)`);

  const drafts = await contentAgent({ runId, context: { client } });
  if (drafts.length > 0) summary.push(`Created ${drafts.length} new draft(s)`);

  const openTickets = getOpenTickets.all();
  if (openTickets.length > 0) {
    for (const t of openTickets) {
      await supportAgent({
        runId,
        context: { message: t.message, client: db.prepare(`SELECT * FROM clients WHERE id = ?`).get(t.client_id), customer: t.customer },
      });
    }
    summary.push(`Resolved ${openTickets.length} support ticket(s)`);
  } else {
    logEvent({ runId, agent: "Orchestrator", action: "skip", detail: "No open support tickets.", level: "warn" });
  }

  await analyticsAgent({ runId, context: { client } });
  summary.push("Logged daily analytics");

  await billingAgent({ runId, context: { client } });

  db.prepare(`UPDATE runs SET status = 'complete', finished_at = datetime('now'), summary = ?, decisions = ? WHERE id = ?`).run(
    summary.join(". ") + ".",
    `priority=${priority}`,
    runId,
  );

  logEvent({
    runId,
    agent: "Orchestrator",
    action: "cycle_complete",
    detail: `Cycle done: ${summary.join("; ")}.`,
    level: "success",
  });
  return { runId, status: "complete", summary };
}

export async function runSingle(clientId, task) {
  const runId = uniqueId("run");
  db.prepare(`INSERT INTO runs (id, status, started_at) VALUES (?, 'running', datetime('now'))`).run(runId);
  logEvent({
    runId,
    agent: "Orchestrator",
    action: "task_start",
    detail: `Single task "${task}" dispatched.`,
  });
  const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(clientId);
  const result = await contentAgent({ runId, context: { client, force: task === "generate_content" } });
  db.prepare(`UPDATE runs SET status = 'complete', finished_at = datetime('now'), summary = ? WHERE id = ?`).run(
    `Generated ${result.length} content draft(s).`,
    runId,
  );
  logEvent({ runId, agent: "Orchestrator", action: "task_complete", detail: `Task "${task}" complete.`, level: "success" });
  return { runId, result: result.length };
}
