import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, openEventStream } from "../api";
import type {
  AgentEvent,
  Client,
  ContentPost,
  DashboardData,
  Invoice,
  Report,
  Ticket,
} from "../types";

function fmtMoney(n: number) {
  return "$" + Math.round(n).toLocaleString();
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Dashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [content, setContent] = useState<ContentPost[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);

  const loadAll = useCallback(async (id?: string) => {
    const cid = id || clientId || "cli_bean";
    const [d, c, t, i, r, e] = await Promise.all([
      api.dashboard(cid),
      api.content(cid),
      api.tickets(cid),
      api.invoices(cid),
      api.reports(cid),
      api.events(60),
    ]);
    setData(d);
    setContent(c);
    setTickets(t);
    setInvoices(i);
    setReports(r);
    setEvents(e);
  }, [clientId]);

  useEffect(() => {
    api.clients().then((cs) => {
      setClients(cs);
      if (!clientId && cs.length) {
        setClientId(cs[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (clientId) loadAll(clientId);
  }, [clientId, loadAll]);

  useEffect(() => {
    const close = openEventStream((ev) => {
      setEvents((prev) => {
        if (prev.some((p) => p.id === ev.id)) return prev;
        const next = [...prev, ev];
        return next.length > 300 ? next.slice(next.length - 300) : next;
      });
    });
    return close;
  }, []);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight });
  }, [events.length]);

  const runCycle = async () => {
    setBusy(true);
    try {
      await api.runCycle();
      await loadAll();
    } finally {
      setBusy(false);
    }
  };

  const regenerate = async () => {
    setBusy(true);
    try {
      await api.runTask(clientId, "generate_content");
      setContent(await api.content(clientId));
    } finally {
      setBusy(false);
    }
  };

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    setChatMsg("");
    const { response } = await api.sendTicket(clientId, "Live demo user", chatMsg);
    setTickets(await api.tickets(clientId));
    setEvents([
      {
        id: Date.now(),
        agent: "SupportAgent",
        action: "resolved",
        detail: response,
        level: "success",
        created_at: new Date().toISOString(),
      },
      ...events,
    ]);
  };

  const chart = useMemo(() => {
    if (!data) return [];
    const byDay = new Map<string, { day: string; revenue: number; engagement: number }>();
    for (const m of data.metrics) {
      const row = byDay.get(m.day) || { day: m.day, revenue: 0, engagement: 0 };
      if (m.metric === "revenue") row.revenue += m.value;
      if (m.metric === "engagement") row.engagement += m.value;
      byDay.set(m.day, row);
    }
    return Array.from(byDay.values()).slice(-14);
  }, [data]);

  const kpis = useMemo(() => {
    const leads = data?.metrics.filter((m) => m.metric === "leads").slice(-7);
    const leads7 = leads?.reduce((s, m) => s + m.value, 0) || 0;
    const published = content.filter((c) => c.status === "published").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    const revenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
    return {
      revenue: Math.round(revenue * 100) / 100,
      leads7,
      published,
      resolved,
    };
  }, [data, content, tickets, invoices]);

  if (!data) {
    return (
      <main className="container" style={{ paddingTop: 80, textAlign: "center" }}>
        <span className="live-dot" /> Loading agency dashboard…
      </main>
    );
  }

  const latestReport = data.latestReport || reports[0];

  return (
    <main className="container" style={{ paddingTop: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <select
          className="select"
          style={{ width: 260 }}
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} · {c.location}
            </option>
          ))}
        </select>
        <span className={`badge ${data.agents_running ? "badge-green" : "badge-amber"}`}>
          <span className="live-dot" />
          {data.agents_running ? `AI live in production · ${data.model}` : "Simulation engine active"}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button className="btn" onClick={regenerate} disabled={busy}>
            {busy ? "Agents working…" : "Generate content"}
          </button>
          <button className="btn btn-primary" onClick={runCycle} disabled={busy}>
            {busy ? "Running cycle…" : "Run daily cycle"}
          </button>
        </div>
      </div>

      <div className="grid grid-4" style={{ marginTop: 22 }}>
        <div className="card kpi">
          <div className="label">Revenue collected</div>
          <div className="value">{fmtMoney(kpis.revenue)}</div>
          <div className="delta">paid in SOL/USDC by BillingAgent</div>
        </div>
        <div className="card kpi">
          <div className="label">New leads (7d)</div>
          <div className="value">{kpis.leads7}</div>
          <div className="delta">▲ captured by agent content</div>
        </div>
        <div className="card kpi">
          <div className="label">Posts published</div>
          <div className="value">{kpis.published}</div>
          <div className="delta">by SocialAgent this month</div>
        </div>
        <div className="card kpi">
          <div className="label">Support resolved</div>
          <div className="value">{kpis.resolved}</div>
          <div className="delta">by SupportAgent, 24/7</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Revenue attributed to agents</h3>
          <div style={{ height: 220, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} width={44} />
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10 }} labelStyle={{ color: "#0f172a" }} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Live agent execution</h3>
            <span className="badge badge-green">
              <span className="live-dot" /> streaming
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
                  <span className="feed-time">{fmtTime(ev.created_at)}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Content queue · ContentAgent</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
            {content.slice(0, 5).map((p) => (
              <div className="post-card" key={p.id}>
                <div className="post-meta">
                  <span className={`badge ${p.status === "published" ? "badge-green" : "badge-amber"}`}>
                    {p.status}
                  </span>
                  <span className="badge badge-indigo">{p.platform}</span>
                  {p.status === "published" && (
                    <span style={{ color: "var(--text-dim)", fontSize: 11.5 }}>
                      {p.engagement} interactions
                    </span>
                  )}
                </div>
                <span>{p.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Customer support · SupportAgent</h3>
          <div className="chat-box" style={{ marginTop: 10 }}>
            {tickets.slice(0, 6).map((t) => (
              <div key={t.id}>
                <div className="bubble user">
                  <div className="who">{t.customer}</div>
                  {t.message}
                </div>
                <div className="bubble ai" style={{ marginTop: 6 }}>
                  <div className="who">SupportAgent · resolved in ~15s</div>
                  {t.agent_response}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              className="input"
              placeholder="Ask like a customer… e.g. 'Open on Sunday?'"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={busy}>
              Send
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Invoices · BillingAgent · paid in SOL/USDC</h3>
          <table style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>#{inv.id.slice(-6)}</td>
                  <td>{fmtMoney(inv.amount)}</td>
                  <td>
                    <span className={`badge ${inv.status === "paid" ? "badge-green" : "badge-amber"}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-dim)" }}>{inv.due_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              marginTop: 10,
              fontSize: 12.5,
              color: "var(--text-dim)",
              background: "var(--bg-soft)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "8px 12px",
              fontFamily: "ui-monospace, monospace",
              wordBreak: "break-all",
            }}
          >
            Pay: BKGeieF4mZsBjiZ45mJAMkfnHpH4HskCw8S1R7fr5PQ3 (SOL/USDC)
          </div>
        </div>

        <div className="card">
          <h3>Weekly report · AnalyticsAgent</h3>
          {latestReport ? (
            <div className="report" style={{ maxHeight: 320, overflowY: "auto", marginTop: 8 }}>
              {latestReport.content}
            </div>
          ) : (
            <p style={{ color: "var(--text-dim)" }}>No report yet — run a cycle to generate one.</p>
          )}
        </div>
      </div>
    </main>
  );
}
