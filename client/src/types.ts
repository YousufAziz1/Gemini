export interface Client {
  id: string;
  name: string;
  industry: string;
  location: string;
  tagline: string;
  avatar: string;
  mrr: number;
  status: string;
}

export interface AgentEvent {
  id: number | string;
  run_id?: string | null;
  agent: string;
  action: string;
  detail: string;
  level: string;
  created_at: string;
}

export interface MetricPoint {
  day: string;
  metric: string;
  value: number;
}

export interface ContentPost {
  id: string;
  client_id: string;
  platform: string;
  status: string;
  text: string;
  created_by: string;
  engagement: number;
  created_at: string;
  published_at?: string | null;
}

export interface Ticket {
  id: string;
  client_id: string;
  customer: string;
  message: string;
  agent_response: string;
  status: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_at?: string | null;
}

export interface Report {
  id: string;
  client_id: string;
  period: string;
  content: string;
  created_at: string;
}

export interface DashboardData {
  client: Client;
  metrics: MetricPoint[];
  content: { status: string; c: number }[];
  invoices: { status: string; total: number }[];
  tickets: { status: string; c: number }[];
  latestReport: Report | null;
  agents_running: boolean;
  model: string;
}

export interface StatusInfo {
  ai_live: boolean;
  model: string;
  agency: string;
}
