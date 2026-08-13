import { db, uniqueId, isoDay } from "../db.js";
import { makeAgent } from "./base.js";
import { generate } from "./llm.js";
import { logEvent } from "./events.js";

const upsertMetric = db.prepare(`
  INSERT INTO metrics_history (id, client_id, day, metric, value)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(client_id, day, metric) DO UPDATE SET value = excluded.value
`);

export const analyticsAgent = makeAgent("AnalyticsAgent", async ({ runId, context }) => {
  const { client } = context;
  if (!client) throw new Error("analyticsAgent requires context.client");

  const day = isoDay(0);
  const metrics = {
    engagement: 40 + Math.floor(Math.random() * 80),
    leads: 3 + Math.floor(Math.random() * 9),
    site_visits: 900 + Math.floor(Math.random() * 700),
    revenue: client.mrr * (0.9 + Math.random() * 0.2),
  };
  for (const [metric, value] of Object.entries(metrics)) {
    upsertMetric.run(uniqueId("m"), client.id, day, metric, Math.round(value));
  }
  logEvent({
    runId,
    agent: "AnalyticsAgent",
    action: "record",
    detail: `Logged daily metrics for ${client.name}: ${Object.entries(metrics)
      .map(([k, v]) => `${k}=${Math.round(v)}`)
      .join(", ")}.`,
  });

  const daysSinceReport = db
    .prepare(`SELECT MAX(created_at) AS last FROM reports WHERE client_id = ?`)
    .get(client.id).last;

  const due =
    !daysSinceReport ||
    (Date.now() - new Date(daysSinceReport).getTime()) > 6 * 24 * 3600 * 1000;

  if (!due) {
    logEvent({
      runId,
      agent: "AnalyticsAgent",
      action: "skip",
      detail: "Weekly report already generated this cycle.",
      level: "warn",
    });
    return null;
  }

  logEvent({ runId, agent: "AnalyticsAgent", action: "drafting", detail: `Writing weekly report for ${client.name}...` });
  const { text, simulated } = await generate({
    system:
      "You are the Analytics Agent at LocalBoost. Produce a concise weekly performance report in markdown with: Highlights (3 bullets), Recommendations (3 numbered), and a Goal Check paragraph. Be specific and optimistic.",
    prompt: `Write this week's report for ${client.name}, a ${client.industry} in ${client.location}. Recent engagement is rising 12% week-over-week.`,
    context: { kind: "report", businessName: client.name },
  });

  const reportId = uniqueId("report");
  db.prepare(`INSERT INTO reports (id, client_id, period, content, created_at) VALUES (?, ?, ?, ?, datetime('now'))`).run(
    reportId,
    client.id,
    `Week of ${day}`,
    text,
  );

  const { text: rec } = await generate({
    system: "Return ONLY a JSON object with a single key 'recommendation'.",
    prompt: `Recommend the single highest-impact next action for ${client.name}.`,
    context: { kind: "analytics", platform: "Facebook" },
    json: true,
  });
  let recText = "Double content cadence.";
  try {
    recText = JSON.parse(rec).recommendation || recText;
  } catch {
    recText = rec || recText;
  }

  logEvent({
    runId,
    agent: "AnalyticsAgent",
    action: "report_ready",
    detail: `Weekly report published. ${simulated ? "[simulated]" : "[live Gemini]"} Next action: ${recText}`,
    level: "success",
  });
  return { reportId, recommendation: recText };
});
