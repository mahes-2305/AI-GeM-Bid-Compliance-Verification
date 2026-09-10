import { useState } from "react";
import "./Dashboard.css";
import ComplianceChecks from "./ComplianceChecks";

/* ---------- inline icons ---------- */
const icons = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1.6" /><rect x="13" y="3" width="8" height="8" rx="1.6" />
      <rect x="3" y="13" width="8" height="8" rx="1.6" /><rect x="13" y="13" width="8" height="8" rx="1.6" />
    </svg>
  ),
  bids: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5h10L20 7v13.5H4V7L7 3.5Z" /><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.2 4.5 6v6c0 4.6 3.2 8.4 7.5 9.8 4.3-1.4 7.5-5.2 7.5-9.8V6L12 3.2Z" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 2.8h7.2L18 7.2v14H6.5V2.8Z" /><path d="M13.5 2.8V7.2H18" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V5M4 19h16" /><path d="M8 19v-6M12.5 19V9M17 19v-9" />
    </svg>
  ),
  gear: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V19.5a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H4.5a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1-1.55V4.5a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.55 1h.19a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1Z" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9a6 6 0 1 1 12 0c0 3.5 1 5 1.6 6H4.4C5 14 6 12.5 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><path d="m20.5 20.5-4-4" />
    </svg>
  ),
  up: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 15l6-6 6 6" />
    </svg>
  ),
  down: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: icons.grid },
  { key: "bids", label: "Bids", icon: icons.bids },
  { key: "compliance", label: "Compliance Checks", icon: icons.shield },
  { key: "documents", label: "Documents", icon: icons.doc },
  { key: "reports", label: "Reports", icon: icons.chart },
  { key: "settings", label: "Settings", icon: icons.gear },
];

const STATS = [
  { label: "Bids Processed", value: "1,284", delta: "+8.2%", trend: "up", note: "vs last 30 days" },
  { label: "Average Compliance Score", value: "91.4%", delta: "+2.1%", trend: "up", note: "across active tenders" },
  { label: "Pending Review", value: "37", delta: "-5", trend: "down", note: "awaiting officer action" },
  { label: "Flagged Non-Compliant", value: "12", delta: "+3", trend: "up", note: "requires attention" },
];

const QUEUE = [
  { id: "GeM/BID/24831", vendor: "Aravali Steel Works", category: "Civil Supplies", score: 96, status: "Compliant", updated: "2h ago" },
  { id: "GeM/BID/24829", vendor: "Nirmaan Infratech Pvt Ltd", category: "Construction", score: 88, status: "Compliant", updated: "3h ago" },
  { id: "GeM/BID/24824", vendor: "Kavya Medical Devices", category: "Healthcare", score: 54, status: "Flagged", updated: "5h ago" },
  { id: "GeM/BID/24818", vendor: "Trivedi Electronics", category: "IT Hardware", score: 74, status: "Under Review", updated: "6h ago" },
  { id: "GeM/BID/24811", vendor: "Suryoday Textiles", category: "Uniforms & Fabric", score: 91, status: "Compliant", updated: "1d ago" },
  { id: "GeM/BID/24805", vendor: "Bharat Logistics Corp", category: "Transport Services", score: 39, status: "Flagged", updated: "1d ago" },
];

const TREND = [62, 68, 71, 69, 77, 82, 85, 80, 88, 91, 89, 94];
const TREND_LABELS = ["W1","W2","W3","W4","W5","W6","W7","W8","W9","W10","W11","W12"];

const ACTIVITY = [
  { title: "Compliance check completed", detail: "GeM/BID/24831 · Aravali Steel Works", time: "12 min ago" },
  { title: "Document mismatch flagged", detail: "GeM/BID/24824 · GST certificate expired", time: "1 hr ago" },
  { title: "New bid submitted for review", detail: "GeM/BID/24837 · Om Sai Enterprises", time: "2 hr ago" },
  { title: "Officer override approved", detail: "GeM/BID/24818 · Trivedi Electronics", time: "4 hr ago" },
];

function statusClass(status) {
  if (status === "Compliant") return "badge badge-ok";
  if (status === "Flagged") return "badge badge-flag";
  return "badge badge-pending";
}

function scoreClass(score) {
  if (score >= 85) return "score score-ok";
  if (score >= 60) return "score score-mid";
  return "score score-low";
}

export default function Dashboard({ userName = "Officer Priya Menon" }) {
  const [active, setActive] = useState("overview");

  return (
    <div className="db-shell">
      <aside className="db-sidebar">
        <div className="db-logo">
          <div className="db-logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v6" /><path d="M7 9l5 9 5-9" />
            </svg>
          </div>
          <span className="db-logo-text">NexVerify<em>AI</em></span>
        </div>

        <nav className="db-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={"db-nav-item" + (active === item.key ? " is-active" : "")}
              onClick={() => setActive(item.key)}
            >
              <span className="db-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="db-sidebar-footer">
          <div className="db-avatar">PM</div>
          <div>
            <p className="db-sidebar-name">{userName}</p>
            <p className="db-sidebar-role">Compliance Officer</p>
          </div>
        </div>
      </aside>

      <div className="db-main">

  {active === "compliance" ? (
    <ComplianceChecks />
  ) : (
    <>
      <header className="db-topbar">
          <div>
            <h1>Compliance Overview</h1>
            <p>GeM procurement bids · updated moments ago</p>
          </div>
          <div className="db-topbar-actions">
            <div className="db-search">
              {icons.search}
              <input type="text" placeholder="Search bid ID, vendor, tender..." />
            </div>
            <button className="db-icon-btn" aria-label="Notifications">
              {icons.bell}
              <span className="db-dot" />
            </button>
            <div className="db-avatar db-avatar-sm">PM</div>
          </div>
        </header>

        <section className="db-stats">
          {STATS.map((s) => (
            <div className="db-stat-card" key={s.label}>
              <p className="db-stat-label">{s.label}</p>
              <div className="db-stat-value-row">
                <span className="db-stat-value">{s.value}</span>
                <span className={"db-stat-delta " + (s.trend === "up" ? "is-up" : "is-down")}>
                  {s.trend === "up" ? icons.up : icons.down}
                  {s.delta}
                </span>
              </div>
              <p className="db-stat-note">{s.note}</p>
            </div>
          ))}
        </section>

        <section className="db-panels">
          <div className="db-panel db-panel-queue">
            <div className="db-panel-head">
              <h2>Compliance Verification Queue</h2>
              <button className="db-link-btn">View all</button>
            </div>
            <table className="db-table">
              <thead>
                <tr>
                  <th>Bid ID</th>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {QUEUE.map((row) => (
                  <tr key={row.id}>
                    <td className="db-mono">{row.id}</td>
                    <td>{row.vendor}</td>
                    <td className="db-muted">{row.category}</td>
                    <td>
                      <span className={scoreClass(row.score)}>{row.score}</span>
                    </td>
                    <td><span className={statusClass(row.status)}>{row.status}</span></td>
                    <td className="db-muted">{row.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="db-side-panels">
            <div className="db-panel">
              <div className="db-panel-head">
                <h2>Compliance Trend</h2>
                <span className="db-muted db-small">Last 12 weeks</span>
              </div>
              <div className="db-trend">
                {TREND.map((v, i) => (
                  <div className="db-trend-col" key={i}>
                    <div className="db-trend-bar" style={{ height: `${v}%` }} />
                    <span className="db-trend-label">{TREND_LABELS[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="db-panel">
              <div className="db-panel-head">
                <h2>Recent Activity</h2>
              </div>
              <ul className="db-activity">
                {ACTIVITY.map((a, i) => (
                  <li key={i}>
                    <span className="db-activity-dot" />
                    <div>
                      <p className="db-activity-title">{a.title}</p>
                      <p className="db-activity-detail">{a.detail}</p>
                    </div>
                    <span className="db-activity-time">{a.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
                  </section>
        </>
      )}
    </div>
  </div>
);
}
