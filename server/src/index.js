import "./env.js";
import express from "express";
import { db, uniqueId, isoDay } from "./db.js";
import { seedIfEmpty } from "./seed.js";
import { subscribe, getRecent, logEvent } from "./agents/events.js";
import { runDailyCycle, runSingle } from "./agents/orchestrator.js";
import { onboardAgent } from "./agents/onboardAgent.js";
import { contentAgent } from "./agents/contentAgent.js";
import { supportAgent } from "./agents/supportAgent.js";
import { isLive, currentModel } from "./agents/llm.js";

const app = express();
app.use(express.json());

const CORS = process.env.CORS_ORIGIN || "*";
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", CORS);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

seedIfEmpty();

const PORT = process.env.PORT || 8080;
const PULSE = process.env.LOCALBOOST_PULSE !== "false";

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/status", (_req, res) => {
  res.json({
    ai_live: isLive(),
    model: currentModel(),
    agency: "LocalBoost",
    version: "1.0.0",
  });
});

app.get("/api/clients", (_req, res) => {
  res.json(db.prepare(`SELECT * FROM clients ORDER BY created_at ASC`).all());
});

app.get("/api/dashboard", (req, res) => {
  const clientId = req.query.client_id || db.prepare(`SELECT id FROM clients ORDER BY created_at ASC LIMIT 1`).get()?.id;
  const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(clientId);
  if (!client) return res.status(404).json({ error: "client not found" });

  const metrics = db
    .prepare(`SELECT day, metric, value FROM metrics_history WHERE client_id = ? ORDER BY day ASC`)
    .all(client.id);

  const content = db
    .prepare(`SELECT status, COUNT(*) AS c FROM content_posts WHERE client_id = ? GROUP BY status`)
    .all(client.id);

  const invoices = db
    .prepare(`SELECT status, COALESCE(SUM(amount),0) AS total FROM invoices WHERE client_id = ? GROUP BY status`)
    .all(client.id);

  const tickets = db
    .prepare(`SELECT status, COUNT(*) AS c FROM support_tickets WHERE client_id = ? GROUP BY status`)
    .all(client.id);

  const latestReport = db
    .prepare(`SELECT * FROM reports WHERE client_id = ? AND period != '30-Day Onboarding Plan' ORDER BY created_at DESC LIMIT 1`)
    .get(client.id);

  res.json({
    client,
    metrics,
    content,
    invoices,
    tickets,
    latestReport,
    agents_running: isLive(),
    model: currentModel(),
  });
});

app.get("/api/content", (req, res) => {
  const clientId = req.query.client_id;
  const rows = db
    .prepare(`SELECT * FROM content_posts WHERE client_id = ? ORDER BY created_at DESC`)
    .all(clientId || "cli_bean");
  res.json(rows);
});

app.get("/api/tickets", (req, res) => {
  const clientId = req.query.client_id;
  res.json(db.prepare(`SELECT * FROM support_tickets WHERE client_id = ? ORDER BY created_at DESC`).all(clientId || "cli_bean"));
});

app.get("/api/invoices", (req, res) => {
  const clientId = req.query.client_id;
  res.json(db.prepare(`SELECT * FROM invoices WHERE client_id = ? ORDER BY created_at DESC`).all(clientId || "cli_bean"));
});

app.get("/api/reports", (req, res) => {
  const clientId = req.query.client_id;
  res.json(db.prepare(`SELECT * FROM reports WHERE client_id = ? ORDER BY created_at DESC`).all(clientId || "cli_bean"));
});

app.get("/api/events", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 60, 300);
  res.json(getRecent(limit));
});

app.get("/api/events/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  subscribe(res);
});

app.post("/api/agents/run", async (_req, res) => {
  const result = await runDailyCycle();
  res.json(result);
});

app.post("/api/agents/task", async (req, res) => {
  const { client_id, task } = req.body;
  const result = await runSingle(client_id, task || "generate_content");
  res.json(result);
});

app.post("/api/agents/onboard", async (req, res) => {
  const { name, industry, location } = req.body;
  if (!name) return res.status(400).json({ error: "name is required" });
  const client = await onboardAgent({ context: { name, industry, location } });
  if (db.prepare(`SELECT COUNT(*) AS c FROM content_posts WHERE client_id = ?`).get(client.id).c === 0) {
    await contentAgent({ context: { client } });
  }
  res.json(client);
});

app.post("/api/tickets", async (req, res) => {
  const { client_id, customer, message } = req.body;
  if (!message) return res.status(400).json({ error: "message is required" });
  const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(client_id || "cli_bean");
  const result = await supportAgent({ context: { message, customer: customer || "web visitor", client } });
  res.json({ ...result, client_id: client.id });
});

const server = app.listen(PORT, () => {
  console.log(`[LocalBoost] agency server on :${PORT}`);
  console.log(`[LocalBoost] AI engine: ${isLive() ? `LIVE Gemini (${currentModel()})` : "SIMULATION MODE (set USER_GEMINI_API_KEY to go live)"}`);
  logEvent({ agent: "Orchestrator", action: "boot", detail: `LocalBoost agency server started. AI engine: ${currentModel()}.`, level: "success" });
});

if (PULSE) {
  const pulse = setInterval(async () => {
    const clients = db.prepare(`SELECT * FROM clients`).all();
    if (clients.length === 0) return;
    const client = clients[Math.floor(Math.random() * clients.length)];
    const customer = ["Maya R.", "James T.", "Priya S.", "Leo M.", "Nina K."][Math.floor(Math.random() * 5)];
    const msg = [
      "Are you open this Sunday?",
      "Do you offer any first-time customer discount?",
      "Can you help me with a quick question about your services?",
      "What are your hours this week?",
      "How fast is the turnaround for this service?",
    ][Math.floor(Math.random() * 5)];
    try {
      await supportAgent({ context: { message: msg, customer, client } });
    } catch (err) {
      console.warn("[pulse]", err.message);
    }
  }, 25000);
  server.on("close", () => clearInterval(pulse));
}

process.on("unhandledRejection", (err) => console.warn("[unhandled]", err.message));
