import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.LB_DATA_DIR || join(__dirname, "..", "data");
mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(join(DATA_DIR, "localboost.db"));

db.exec(`
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS clients (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  industry    TEXT NOT NULL,
  location    TEXT NOT NULL,
  tagline     TEXT,
  avatar      TEXT DEFAULT '#4f46e5',
  mrr         REAL NOT NULL DEFAULT 0,
  status      TEXT DEFAULT 'active',
  onboarded_by TEXT,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id           TEXT PRIMARY KEY,
  client_id    TEXT,
  customer     TEXT,
  source       TEXT,
  status       TEXT DEFAULT 'qualified',
  value        REAL,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS content_posts (
  id         TEXT PRIMARY KEY,
  client_id  TEXT NOT NULL,
  platform   TEXT NOT NULL,
  status     TEXT DEFAULT 'draft',
  text       TEXT NOT NULL,
  created_by TEXT DEFAULT 'ContentAgent',
  approved_at TEXT,
  published_at TEXT,
  engagement INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id            TEXT PRIMARY KEY,
  client_id     TEXT NOT NULL,
  customer      TEXT,
  message       TEXT NOT NULL,
  agent_response TEXT,
  status        TEXT DEFAULT 'open',
  resolved_at   TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS invoices (
  id         TEXT PRIMARY KEY,
  client_id  TEXT NOT NULL,
  amount     REAL NOT NULL,
  status     TEXT DEFAULT 'pending',
  due_date   TEXT,
  paid_at    TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id         TEXT PRIMARY KEY,
  client_id  TEXT NOT NULL,
  period     TEXT,
  content    TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS metrics_history (
  id        TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  day       TEXT NOT NULL,
  metric    TEXT NOT NULL,
  value     REAL NOT NULL,
  UNIQUE(client_id, day, metric)
);

CREATE TABLE IF NOT EXISTS agent_events (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id   TEXT,
  agent    TEXT NOT NULL,
  action   TEXT NOT NULL,
  detail   TEXT,
  level    TEXT DEFAULT 'info',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS runs (
  id         TEXT PRIMARY KEY,
  status     TEXT DEFAULT 'running',
  summary    TEXT,
  decisions  TEXT,
  started_at TEXT DEFAULT (datetime('now')),
  finished_at TEXT
);
`);

export function now() {
  return new Date().toISOString();
}

export function daysAgoISO(days, atMidnight = false) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  if (atMidnight) d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function isoDay(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export function uniqueId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function rows(statement, ...params) {
  return statement.all(...params);
}

export function first(statement, ...params) {
  return statement.get(...params);
}
