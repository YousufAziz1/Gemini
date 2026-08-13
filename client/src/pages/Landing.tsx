import { useState } from "react";
import Reveal from "../components/Reveal";

interface Props {
  onDemo: () => void;
}

const BUSINESSES = [
  "Bloom & Bean Coffee",
  "Apex Auto Care",
  "Village Pizza",
  "Lakeside Dental",
  "Oak St. Barbershop",
  "Sunrise Yoga",
  "Bella's Boutique",
  "Green Thumb Landscaping",
];

const STATS = [
  { num: "2.4x", lbl: "Average revenue growth" },
  { num: "48k", lbl: "Customer messages answered" },
  { num: "12,400", lbl: "Posts published" },
  { num: "4.9/5", lbl: "Customer satisfaction" },
];

const FEATURES = [
  {
    icon: "CT",
    title: "Ready-to-post content",
    desc: "Fresh, on-brand posts for Google, Instagram and Facebook every week. You approve, we publish.",
  },
  {
    icon: "MS",
    title: "24/7 customer messaging",
    desc: "Every question, review reply and comment answered in seconds — even when you're closed.",
  },
  {
    icon: "RP",
    title: "Clear weekly reports",
    desc: "One simple report every week: what worked, what didn't, and the one thing to do next.",
  },
  {
    icon: "IN",
    title: "Automated invoicing",
    desc: "Your monthly invoice is sent and collected for you. No chasing, no awkward calls.",
  },
  {
    icon: "SE",
    title: "Local SEO that works",
    desc: "Google Business profile optimized and kept current so neighbors find you first.",
  },
  {
    icon: "ON",
    title: "Easy onboarding",
    desc: "Tell us your business details once. Your team is set up and running within a day.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We've spent money on two agencies before. LocalBoost published more in a month than they did in a year — and it actually sounds like us.",
    name: "Maria Gonzales",
    role: "Owner, Bloom & Bean Coffee · Portland, OR",
  },
  {
    quote:
      "Customers message us at 9pm and get an answer in seconds. I didn't realize how many bookings we were losing after hours.",
    name: "Derek Thompson",
    role: "Owner, Apex Auto Care · Denver, CO",
  },
  {
    quote:
      "I'm not tech-savvy at all. If I can read this dashboard, anyone can. The weekly report is the only thing I need to read.",
    name: "Priya Patel",
    role: "Owner, Village Pizza · Austin, TX",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "0",
    priceNote: "/month",
    desc: "Try everything with zero cost.",
    features: [
      "3 AI posts free every month",
      "Customer messaging",
      "Google Business profile",
      "Weekly report",
    ],
  },
  {
    name: "Pay-as-you-go",
    price: "0.30",
    priceNote: "/post",
    desc: "Only pay for what you use. No subscription.",
    features: [
      "Unlimited posts after free 3",
      "24/7 customer messaging",
      "Local SEO + reviews",
      "Weekly report + recommendations",
      "Pay with SOL or USDC",
    ],
    featured: true,
  },
  {
    name: "Volume",
    price: "0.25",
    priceNote: "/post",
    desc: "Lower rate for busy businesses.",
    features: [
      "Discounted rate per post",
      "Priority support",
      "Multi-location campaigns",
      "Dedicated analytics",
    ],
  },
];

const FAQ = [
  {
    q: "How much does it actually cost?",
    a: "Your first 3 posts are free every month. Each post after that costs just $0.30 — you only pay for what you use. No subscription fees.",
  },
  {
    q: "How do I pay?",
    a: "We accept SOL or USDC. Send payment to the wallet address shown on the pricing section and your credits are added automatically within a minute.",
  },
  {
    q: "Do I need to be tech-savvy?",
    a: "No. Everything is set up for you. You review posts with one tap and read a weekly report written in plain English.",
  },
  {
    q: "Who actually writes the content?",
    a: "Our AI agents draft everything, and you approve before anything goes live. Your brand voice stays yours.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no long contracts or subscriptions to cancel — pay-as-you-go means you're always in control.",
  },
];

const WALLET = "BKGeieF4mZsBjiZ45mJAMkfnHpH4HskCw8S1R7fr5PQ3";

export default function Landing({ onDemo }: Props) {
  const [open, setOpen] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  const copyWallet = async () => {
    try {
      await navigator.clipboard.writeText(WALLET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <main>
      {/* HERO */}
      <section className="hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Marketing that runs itself · $249/mo</span>
          </Reveal>
          <Reveal delay={80}>
            <h1>
              Your marketing team, <span className="grad-text">powered by AI</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p>
              LocalBoost helps local businesses publish content, answer customers and track growth —
              automatically. Get an agency's results for a fraction of the cost.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="hero-actions">
              <button className="btn btn-primary btn-lg" onClick={onDemo}>
                Start free trial
              </button>
              <button className="btn btn-lg" onClick={onDemo}>
                See live demo
              </button>
            </div>
            <div className="hero-trust">First 3 posts free · then $0.30/post · pay with SOL or USDC</div>
          </Reveal>
        </div>

        {/* PRODUCT SCREENSHOT */}
        <Reveal delay={300} className="container">
          <div className="browser">
            <div className="browser-bar">
              <span className="browser-dot" style={{ background: "#f87171" }} />
              <span className="browser-dot" style={{ background: "#fbbf24" }} />
              <span className="browser-dot" style={{ background: "#34d399" }} />
              <span className="browser-url">app.localboost.com/dashboard</span>
            </div>
            <div className="app">
              <div className="app-sidebar" />
              <div className="app-main">
                <div className="app-title">Bloom & Bean Coffee</div>
                <div className="app-sub">Portland, OR · Active plan: Growth</div>
                <div className="kpi-row">
                  <div className="kpi-mini">
                    <div className="lbl">Revenue (MTD)</div>
                    <div className="val">$1,482</div>
                    <div className="sub">▲ 18% vs last month</div>
                  </div>
                  <div className="kpi-mini">
                    <div className="lbl">New customers</div>
                    <div className="val">87</div>
                    <div className="sub">▲ 12% this week</div>
                  </div>
                  <div className="kpi-mini">
                    <div className="lbl">Messages answered</div>
                    <div className="val">312</div>
                    <div className="sub">100% in under 2 min</div>
                  </div>
                  <div className="kpi-mini">
                    <div className="lbl">Posts this month</div>
                    <div className="val">42</div>
                    <div className="sub">Avg. 38 interactions</div>
                  </div>
                </div>
                <div className="app-grid">
                  <div className="app-card">
                    <h4>Attributed revenue</h4>
                    <div className="chart-bars">
                      {[35, 48, 40, 62, 58, 74, 69, 85, 78, 92, 88, 100].map((h, i) => (
                        <div className="bar" key={i} style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="app-card">
                    <h4>Agents at work</h4>
                    {[
                      { n: "ContentAgent", s: "3 posts drafted" },
                      { n: "SupportAgent", s: "8 messages resolved" },
                      { n: "BillingAgent", s: "$499 collected" },
                      { n: "AnalyticsAgent", s: "Report ready" },
                    ].map((a) => (
                      <div className="agent-mini" key={a.n}>
                        <span className="avatar-mini">{a.n.slice(0, 2)}</span>
                        <span className="n">{a.n}</span>
                        <span className="s">{a.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* SOCIAL PROOF */}
      <section className="container logos">
        <Reveal>
          <div className="label">TRUSTED BY 200+ LOCAL BUSINESSES ACROSS THE US</div>
          <div className="logos-row">
            {BUSINESSES.map((b) => (
              <span className="logo-item" key={b}>
                {b}
              </span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* STATS */}
      <section className="container">
        <Reveal>
          <div className="stats">
            {STATS.map((s) => (
              <div className="stat" key={s.lbl}>
                <div className="num">{s.num}</div>
                <div className="lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* FEATURES */}
      <section className="container section">
        <Reveal>
          <div className="section-center">
            <span className="section-tag">Everything you need</span>
            <h2>One team for your whole business</h2>
            <p className="section-sub">
              We handle the marketing work you don't have time for — so you can focus on your customers.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90}>
              <div className="card feature">
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container section" style={{ paddingTop: 8 }}>
        <Reveal>
          <div className="section-center">
            <span className="section-tag">Loved by owners</span>
            <h2>Businesses like yours, growing with us</h2>
          </div>
        </Reveal>
        <div className="grid grid-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <div className="card testimonial">
                <div className="stars">★★★★★</div>
                <p className="quote">"{t.quote}"</p>
                <div className="person">
                  <span className="person-avatar">
                    {t.name.split(" ").map((w) => w[0]).join("")}
                  </span>
                  <div>
                    <div className="person-name">{t.name}</div>
                    <div className="person-role">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="container section" style={{ paddingTop: 8 }}>
        <Reveal>
          <div className="section-center">
            <span className="section-tag">Simple pricing</span>
            <h2>3 posts free. Then $0.30 each.</h2>
            <p className="section-sub">
              Your first 3 posts are free every month. After that, pay only for what you use — no
              subscription, no surprise bills.
            </p>
          </div>
        </Reveal>
        <div className="grid grid-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <div className={`pricing ${p.featured ? "featured" : ""}`}>
                {p.featured && <span className="popular-badge">Most popular</span>}
                <div className="plan-name">{p.name}</div>
                <div className="price">
                  ${p.price}
                  <span>{p.priceNote}</span>
                </div>
                <div className="desc">{p.desc}</div>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <button
                  className={`btn ${p.featured ? "btn-primary" : ""}`}
                  onClick={onDemo}
                  style={{ marginTop: "auto" }}
                >
                  {p.name === "Free" ? "Start free" : "Get started"}
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="card" style={{ maxWidth: 640, margin: "22px auto 0", textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Pay with SOL or USDC</div>
            <p style={{ color: "var(--text-dim)", fontSize: 13, margin: "6px 0 14px" }}>
              Send payment to this address. Your post credits are added automatically within a minute.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--bg-soft)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "12px 14px",
              }}
            >
              <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 13, flex: 1, wordBreak: "break-all" }}>
                {WALLET}
              </span>
              <button className="btn" onClick={copyWallet} style={{ padding: "8px 14px", flexShrink: 0 }}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="container section" style={{ paddingTop: 8 }}>
        <Reveal>
          <div className="section-center">
            <span className="section-tag">FAQ</span>
            <h2>Questions? Answered.</h2>
          </div>
        </Reveal>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <div className={`faq-item ${open === i ? "open" : ""}`}>
                <button className="faq-q" onClick={() => setOpen(open === i ? null : i)}>
                  {f.q}
                  <span className="arrow">▼</span>
                </button>
                {open === i && <div className="faq-a">{f.a}</div>}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container">
        <Reveal>
          <div className="cta-banner">
            <h2>Ready to grow your business?</h2>
            <p>Your first 3 posts are free. After that, $0.30 each — paid with SOL or USDC.</p>
            <button className="btn" onClick={onDemo}>
              Start free today
            </button>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
