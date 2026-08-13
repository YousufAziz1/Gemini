import { useEffect, useRef, useState } from "react";
import { api, openEventStream } from "../api";
import type { AgentEvent, Client } from "../types";

const TEAM = [
  { mono: "OR", name: "Orchestrator", role: "CEO agent · plans, prioritizes, audits" },
  { mono: "SA", name: "SalesOnboardingAgent", role: "qualifies leads · signs clients · drafts plans" },
  { mono: "CO", name: "ContentAgent", role: "writes platform-native marketing posts" },
  { mono: "SO", name: "SocialAgent", role: "publishes content · tracks engagement" },
  { mono: "SU", name: "SupportAgent", role: "answers customers 24/7" },
  { mono: "AN", name: "AnalyticsAgent", role: "measures KPIs · writes weekly reports" },
  { mono: "BI", name: "BillingAgent", role: "invoices · collects · confirms cash" },
];

const AI_DOES = [
  "Decide what to post, when, and to whom",
  "Draft and publish all marketing content",
  "Answer every customer message instantly",
  "Chase and collect every invoice",
  "Measure results and recommend the next move",
  "Onboard new clients and write growth plans",
];

const HUMANS_DO = [
  "Approve big brand changes (once a month)",
  "Add their local knowledge to prompts",
  "Review the weekly analytics report",
  "Reply to the handful of edge-case customers",
  "Answer the phone (for now)",
];

export default function AgentsConsole() {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [notice, setNotice] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.clients().then(setClients);
    api.events(80).then(setEvents);
    const close = openEventStream((ev) =>
      setEvents((prev) => {
        if (prev.some((p) => p.id === ev.id)) return prev;
        return [...prev, ev].slice(-300);
      }),
    );
    return close;
  }, []);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
  }, [events.length]);

  const runCycle = async () => {
    setBusy(true);
    try {
      const r = await api.runCycle();
      setNotice(`Cycle complete: ${r.summary.join(" · ")}`);
    } finally {
      setBusy(false);
    }
  };

  const onboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      const c = await api.onboard(name.trim(), industry.trim() || "Local business", location.trim() || "Local area");
      setNotice(`Onboarded ${c.name} · plan drafted · initial content generated.`);
      setName("");
      setClients(await api.clients());
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container" style={{ paddingTop: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>The Agent Team</h2>
          <div style={{ color: "var(--text-dim)", fontSize: 13, marginTop: 2 }}>
            Every role below runs autonomously. Humans review, agents execute.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button className="btn btn-primary" onClick={runCycle} disabled={busy}>
            {busy ? "Agents working…" : "Run full operating cycle"}
          </button>
        </div>
      </div>

      {notice && (
        <div
          className="badge badge-green"
          style={{ marginTop: 14, fontSize: 13, padding: "8px 14px" }}
        >
          {notice}
        </div>
      )}

      <div className="card" style={{ marginTop: 18, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--accent)",
            color: "#fff",
            padding: "12px 22px",
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          Orchestrator — runs the daily cycle
        </div>
        <div
          className="grid grid-3"
          style={{ marginTop: 18, gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {TEAM.filter((a) => a.name !== "Orchestrator").map((a) => (
            <div className="agent-node" key={a.name}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="ring">{a.mono}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-dim)" }}>{a.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="matrix-col ai">
          <h3 style={{ margin: 0, color: "var(--accent)" }}>Executed by AI agents</h3>
          <ul style={{ paddingLeft: 18, lineHeight: 1.9, fontSize: 13.5, margin: "12px 0 0" }}>
            {AI_DOES.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="matrix-col human">
          <h3 style={{ margin: 0, color: "var(--green)" }}>Handled by humans</h3>
          <ul style={{ paddingLeft: 18, lineHeight: 1.9, fontSize: 13.5, margin: "12px 0 0" }}>
            {HUMANS_DO.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Onboard a new client (SalesOnboardingAgent)</h3>
          <form onSubmit={onboard} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            <input className="input" placeholder="Business name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="input" placeholder="Industry (e.g. Cafe)" value={industry} onChange={(e) => setIndustry(e.target.value)} />
            <input className="input" placeholder="Location (e.g. Austin, TX)" value={location} onChange={(e) => setLocation(e.target.value)} />
            <button className="btn btn-primary" type="submit" disabled={busy || !name.trim()}>
              {busy ? "Agents working…" : "Sign up this business"}
            </button>
          </form>
          <div style={{ marginTop: 14, color: "var(--text-dim)", fontSize: 12.5 }}>
            Active clients: {clients.map((c) => c.name).join(" · ") || "none yet"}
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Execution log (agent decisions)</h3>
            <span className="badge badge-green">
              <span className="live-dot" /> live
            </span>
          </div>
          <div className="feed" ref={feedRef} style={{ marginTop: 10 }}>
            {events
              .slice()
              .reverse()
              .map((ev) => (
                <div className={`feed-line ${ev.level}`} key={ev.id}>
                  <span className="feed-agent">{ev.agent}</span>
                  <span style={{ color: "var(--text-dim)", whiteSpace: "nowrap" }}>{ev.action}</span>
                  <span style={{ color: "var(--text)" }}>{ev.detail}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </main>
  );
}
