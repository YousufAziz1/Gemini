import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import AgentsConsole from "./pages/AgentsConsole";
import { api } from "./api";
import type { StatusInfo } from "./types";

export type Tab = "landing" | "dashboard" | "console";

export default function App() {
  const [tab, setTab] = useState<Tab>("landing");
  const [status, setStatus] = useState<StatusInfo | null>(null);

  useEffect(() => {
    api.status().then(setStatus).catch(() => {});
  }, []);

  return (
    <>
      <nav className="nav">
        <div className="container nav-inner">
          <a className="logo" href="#" onClick={(e) => { e.preventDefault(); setTab("landing"); }}>
            <span className="logo-mark">LB</span>
            LocalBoost
          </a>
          <div className="nav-links">
            <button
              className={`nav-link${tab === "landing" ? " active" : ""}`}
              onClick={() => setTab("landing")}
            >
              Overview
            </button>
            <button
              className={`nav-link${tab === "dashboard" ? " active" : ""}`}
              onClick={() => setTab("dashboard")}
            >
              Live Dashboard
            </button>
            <button
              className={`nav-link${tab === "console" ? " active" : ""}`}
              onClick={() => setTab("console")}
            >
              Agent Console
            </button>
          </div>
          <div className="nav-right">
            {status && (
              <span className={`badge ${status.ai_live ? "badge-green" : "badge-amber"}`}>
                <span className="live-dot" />
                {status.ai_live ? `AI LIVE · ${status.model}` : "SIMULATION MODE"}
              </span>
            )}
            <button className="btn btn-primary" onClick={() => setTab("dashboard")}>
              See the agents work
            </button>
          </div>
        </div>
      </nav>

      {tab === "landing" && <Landing onDemo={() => setTab("dashboard")} />}
      {tab === "dashboard" && <Dashboard />}
      {tab === "console" && <AgentsConsole />}

      <div className="container footer">
        LocalBoost — a digital agency operated by AI agents. Built for the Build with Gemini XPRIZE.
      </div>
    </>
  );
}
