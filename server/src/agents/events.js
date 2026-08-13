import { db, now, uniqueId } from "../db.js";

const listeners = new Set();

const insert = db.prepare(`
  INSERT INTO agent_events (run_id, agent, action, detail, level, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export function logEvent({ runId = null, agent, action, detail = "", level = "info" }) {
  const ts = now();
  insert.run(runId, agent, action, String(detail).slice(0, 2000), level, ts);
  const event = { id: uniqueId("ev"), run_id: runId, agent, action, detail, level, created_at: ts };
  broadcast(event);
  return event;
}

export function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of listeners) {
    try {
      res.write(payload);
    } catch {
      /* client gone */
    }
  }
}

export function subscribe(res) {
  listeners.add(res);
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true, time: now() })}\n\n`);
  res.on("close", () => listeners.delete(res));
}

export function getRecent(limit = 60) {
  const stmt = db.prepare(`
    SELECT * FROM agent_events
    ORDER BY id DESC LIMIT ?
  `);
  return stmt.all(limit).reverse();
}
