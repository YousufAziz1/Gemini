import type {
  Client,
  DashboardData,
  ContentPost,
  Ticket,
  Invoice,
  Report,
  AgentEvent,
  StatusInfo,
} from "./types";

const BASE = import.meta.env.VITE_API_URL ?? "";

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

export const api = {
  status: () => req<StatusInfo>(`${BASE}/api/status`),
  clients: () => req<Client[]>(`${BASE}/api/clients`),
  dashboard: (clientId?: string) =>
    req<DashboardData>(`${BASE}/api/dashboard${clientId ? `?client_id=${clientId}` : ""}`),
  content: (clientId: string) => req<ContentPost[]>(`${BASE}/api/content?client_id=${clientId}`),
  tickets: (clientId: string) => req<Ticket[]>(`${BASE}/api/tickets?client_id=${clientId}`),
  invoices: (clientId: string) => req<Invoice[]>(`${BASE}/api/invoices?client_id=${clientId}`),
  reports: (clientId: string) => req<Report[]>(`${BASE}/api/reports?client_id=${clientId}`),
  events: (limit = 60) => req<AgentEvent[]>(`${BASE}/api/events?limit=${limit}`),
  runCycle: () => req<{ runId: string; status: string; summary: string[] }>(`${BASE}/api/agents/run`, { method: "POST" }),
  runTask: (clientId: string, task: string) =>
    req<{ runId: string; result: number }>(`${BASE}/api/agents/task`, {
      method: "POST",
      body: JSON.stringify({ client_id: clientId, task }),
    }),
  onboard: (name: string, industry: string, location: string) =>
    req<Client>(`${BASE}/api/agents/onboard`, {
      method: "POST",
      body: JSON.stringify({ name, industry, location }),
    }),
  sendTicket: (clientId: string, customer: string, message: string) =>
    req<{ ticketId: string; response: string }>(`${BASE}/api/tickets`, {
      method: "POST",
      body: JSON.stringify({ client_id: clientId, customer, message }),
    }),
};

export function openEventStream(onEvent: (ev: AgentEvent) => void): () => void {
  const es = new EventSource(`${BASE}/api/events/stream`);
  es.onmessage = (msg) => {
    try {
      onEvent(JSON.parse(msg.data));
    } catch {
      /* ignore */
    }
  };
  return () => es.close();
}
