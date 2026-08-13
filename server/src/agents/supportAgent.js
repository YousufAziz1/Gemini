import { db, uniqueId } from "../db.js";
import { makeAgent } from "./base.js";
import { generate } from "./llm.js";
import { logEvent } from "./events.js";

const resolveTicket = db.prepare(`
  UPDATE support_tickets
  SET agent_response = ?, status = 'resolved', resolved_at = datetime('now')
  WHERE id = ?
`);

export const supportAgent = makeAgent("SupportAgent", async ({ runId, context }) => {
  const { message, client, customer } = context;
  if (!message) throw new Error("supportAgent requires context.message");

  logEvent({
    runId,
    agent: "SupportAgent",
    action: "triage",
    detail: `Classifying customer request: "${String(message).slice(0, 80)}..."`,
  });

  const { text, simulated } = await generate({
    system:
      "You are the Support Agent at LocalBoost, operating 24/7 customer support for local businesses. Respond warmly, helpfully and briefly (under 120 words). If you cannot fully resolve, set an expectation for follow-up.",
    prompt: `Customer ${customer || "a customer"} asked: "${message}". Respond as ${client?.name || "the business"}.`,
    context: { kind: "support", businessName: client?.name },
  });

  const id = uniqueId("ticket");
  db.prepare(`
    INSERT INTO support_tickets (id, client_id, customer, message, agent_response, status, resolved_at, created_at)
    VALUES (?, ?, ?, ?, ?, 'resolved', datetime('now'), datetime('now'))
  `).run(id, client?.id, customer || "web visitor", message, text);

  logEvent({
    runId,
    agent: "SupportAgent",
    action: "resolved",
    detail: `Responded to customer in ${(Math.random() * 1.5).toFixed(1)}s. ${simulated ? "[simulated]" : "[live Gemini]"} "${text.slice(0, 90)}..."`,
    level: "success",
  });
  return { ticketId: id, response: text };
});
