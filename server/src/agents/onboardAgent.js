import { db, uniqueId } from "../db.js";
import { makeAgent } from "./base.js";
import { generate } from "./llm.js";
import { logEvent } from "./events.js";

const insertClient = db.prepare(`
  INSERT INTO clients (id, name, industry, location, tagline, avatar, mrr, status, onboarded_by, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'SalesOnboardingAgent', datetime('now'))
`);

export const onboardAgent = makeAgent("SalesOnboardingAgent", async ({ runId, context }) => {
  const { name, industry, location } = context;
  if (!name) throw new Error("onboardAgent requires context.name");

  logEvent({
    runId,
    agent: "SalesOnboardingAgent",
    action: "qualify",
    detail: `Qualifying lead: ${name} (${industry || "n/a"}, ${location || "n/a"}).`,
  });

  const existing = db.prepare(`SELECT * FROM clients WHERE name = ?`).get(name);
  if (existing) {
    logEvent({
      runId,
      agent: "SalesOnboardingAgent",
      action: "existing_client",
      detail: `${name} is already a client (#${existing.id.slice(-6)}). Reusing profile.`,
      level: "warn",
    });
    return existing;
  }

  const { text: taglineJson, simulated } = await generate({
    system: "Return ONLY a JSON object with keys tagline and recommended_plan.",
    prompt: `Create a one-line brand tagline and recommend a plan (Essentials/Pro) for ${name}, a ${industry} in ${location}.`,
    context: { kind: "onboard", businessName: name },
    json: true,
  });
  let tagline = `${name} — serving the neighborhood with care.`;
  try {
    tagline = JSON.parse(taglineJson).tagline || tagline;
  } catch {
    /* keep default */
  }

  const id = uniqueId("cli");
  insertClient.run(id, name, industry || "Local business", location || "Local area", tagline, "#4f46e5", 499);

  logEvent({
    runId,
    agent: "SalesOnboardingAgent",
    action: "signed",
    detail: `Client signed: ${name} (#${id.slice(-6)}), plan $499/mo. ${simulated ? "[simulated]" : "[live Gemini]"}`,
    level: "success",
  });

  const { text: plan } = await generate({
    system:
      "You are the SalesOnboardingAgent. Produce a 30-day growth plan in markdown (4 weekly sections). Be concrete but avoid inventing exact real-world numbers.",
    prompt: `Draft the 30-day plan for new client ${name}.`,
    context: { kind: "plan", businessName: name },
  });
  db.prepare(`INSERT INTO reports (id, client_id, period, content, created_at) VALUES (?, ?, ?, ?, datetime('now'))`).run(
    uniqueId("report"),
    id,
    "30-Day Onboarding Plan",
    plan,
  );
  logEvent({
    runId,
    agent: "SalesOnboardingAgent",
    action: "plan_drafted",
    detail: `30-day growth plan delivered to ${name}.`,
  });

  return db.prepare(`SELECT * FROM clients WHERE id = ?`).get(id);
});
