import { useEffect, useState } from "react";
import "./Dashboard.css";
import ComplianceChecks from "./ComplianceChecks";
import Bids from "./Bids";

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

export default function Dashboard({
  userName = "Officer Priya Menon",
  onLogout,
}) {
  const [active, setActive] = useState("overview");
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
  const loadSubmissions = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("nexverify_submissions") || "[]"
      );

      setSubmissions(saved);
    } catch (error) {
      console.error(
        "Failed to load submissions:",
        error
      );

      setSubmissions([]);
    }
  };

  loadSubmissions();

  // Refresh when officer returns to the dashboard
  const handleStorageChange = () => {
    loadSubmissions();
  };

  window.addEventListener(
    "storage",
    handleStorageChange
  );

  return () => {
    window.removeEventListener(
      "storage",
      handleStorageChange
    );
  };
  }, []);

  const realQueue = submissions.map((submission) => {
    const result = submission.complianceResult || {};

    let checks = [];

    if (Array.isArray(result.checks)) {
      checks = result.checks;
    } else if (
      result.details &&
      typeof result.details === "object"
    ) {
      checks = Object.entries(result.details).map(
        ([name, value]) => ({
          name,
          status:
            typeof value === "string"
              ? value
              : value?.status || "REVIEW_REQUIRED",
        })
      );
    }

    const passed = checks.filter(
      (check) =>
        String(check.status).toUpperCase() === "PASS"
    ).length;

    const total = checks.length;

    const score =
      total > 0
        ? Math.round((passed / total) * 100)
        : 0;

    const overallStatus =
      submission.overallStatus ||
      result.overallStatus ||
      result.status ||
      "REVIEW_REQUIRED";

    let displayStatus = "Under Review";

    if (overallStatus === "COMPLIANT") {
      displayStatus = "Compliant";
    } else if (overallStatus === "NON-COMPLIANT") {
      displayStatus = "Flagged";
    }

    return {
      id: submission.bidId || "N/A",
      vendor: submission.bidderName || "Bidder User",
      category: submission.bidTitle || "Procurement",
      score,
      status: displayStatus,
      updated: submission.submittedAt
        ? new Date(submission.submittedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Recently",
    };
  });

  const displayQueue =
    realQueue.length > 0
      ? realQueue
      : QUEUE;

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

  <button
    className="db-logout-button"
    onClick={onLogout}
  >
    Logout
  </button>
</div>
      </aside>

      <div className="db-main">

  {active === "compliance" ? (
  <ComplianceChecks />
) : active === "reports" ? (
  <Reports />
) : active === "bids" ? (
  <Bids />
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
                {displayQueue.map((row) => (
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
function Reports() {
  const [submissions, setSubmissions] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("nexverify_submissions") || "[]"
      );
    } catch {
      return [];
    }
  });

  const getStatus = (submission) => {
    return (
      submission.overallStatus ||
      submission.complianceResult?.overallStatus ||
      submission.complianceResult?.status ||
      "REVIEW_REQUIRED"
    );
  };

  const getChecks = (submission) => {
    const result = submission.complianceResult;

    if (!result) return [];

    if (Array.isArray(result.checks)) {
      return result.checks;
    }

    if (result.details && typeof result.details === "object") {
      return Object.entries(result.details).map(([name, value]) => ({
        name,
        status:
          typeof value === "string"
            ? value
            : value?.status || "REVIEW_REQUIRED",
        message:
          typeof value === "object"
            ? value?.message || value?.reason || ""
            : "",
      }));
    }

    return [];
  };

  const getCounts = (submission) => {
    const checks = getChecks(submission);

    return {
      passed: checks.filter(
        (check) =>
          String(check.status).toUpperCase() === "PASS"
      ).length,

      failed: checks.filter(
        (check) =>
          String(check.status).toUpperCase() === "FAIL"
      ).length,

      review: checks.filter(
        (check) =>
          String(check.status).toUpperCase() ===
          "INSUFFICIENT_DATA"
      ).length,
    };
  };

  const statusClass = (status) => {
    if (status === "COMPLIANT") return "report-status report-pass";
    if (status === "NON-COMPLIANT") return "report-status report-fail";
    return "report-status report-review";
  };

  const downloadReport = (submission) => {
  const checks = getChecks(submission);
  const counts = getCounts(submission);

  const status =
    submission.overallStatus ||
    submission.complianceResult?.overallStatus ||
    submission.complianceResult?.status ||
    "REVIEW_REQUIRED";

  const statusText =
    status === "COMPLIANT"
      ? "COMPLIANT"
      : status === "NON-COMPLIANT"
      ? "NON-COMPLIANT"
      : "REVIEW REQUIRED";

  const checkRows = checks
    .map((check) => {
      const name =
        check.name ||
        check.field ||
        check.requirement ||
        "Compliance Requirement";

      const rawStatus =
        check.status ||
        check.result ||
        "REVIEW_REQUIRED";

      const normalizedStatus =
        String(rawStatus).toUpperCase();

      const displayStatus =
        normalizedStatus === "PASS"
          ? "PASS"
          : normalizedStatus === "FAIL"
          ? "FAIL"
          : "REVIEW REQUIRED";

      const details =
        check.message ||
        check.reason ||
        check.details ||
        "";

      return `
        <tr>
          <td>${name}</td>
          <td class="status-${normalizedStatus}">
            ${displayStatus}
          </td>
          <td>${details}</td>
        </tr>
      `;
    })
    .join("");

  const officerAction =
    status === "COMPLIANT"
      ? "Bid satisfies the available compliance requirements."
      : status === "NON-COMPLIANT"
      ? "Bid does not satisfy one or more mandatory requirements."
      : "Officer review is required because some compliance information could not be verified from the submitted documents.";

  const reportWindow = window.open("", "_blank");

  if (!reportWindow) {
    alert(
      "Please allow pop-ups to generate the verification report."
    );
    return;
  }

  reportWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>

      <title>NexVerifyAI Verification Report</title>

      <style>

        @page {
          size: A4;
          margin: 18mm;
        }

        * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, Helvetica, sans-serif;
          color: #172033;
          margin: 0;
          line-height: 1.5;
        }

        .header {
          border-bottom: 3px solid #4164e8;
          padding-bottom: 16px;
          margin-bottom: 25px;
        }

        .brand {
          font-size: 28px;
          font-weight: 800;
          color: #4164e8;
          margin-bottom: 5px;
        }

        .title {
          font-size: 21px;
          font-weight: 700;
          margin: 0;
        }

        .subtitle {
          color: #68758f;
          margin-top: 5px;
        }

        .section {
          margin-top: 24px;
        }

        .section h2 {
          font-size: 17px;
          margin-bottom: 12px;
          border-bottom: 1px solid #dfe4ee;
          padding-bottom: 7px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 25px;
        }

        .info-item {
          padding: 9px 0;
          border-bottom: 1px solid #eef1f5;
        }

        .label {
          color: #68758f;
          font-size: 11px;
          text-transform: uppercase;
          font-weight: 700;
        }

        .value {
          font-size: 14px;
          font-weight: 600;
          margin-top: 2px;
        }

        .overall {
          margin-top: 20px;
          padding: 18px;
          border: 1px solid #dfe4ee;
          border-radius: 10px;
          background: #f7f9fd;
        }

        .overall-title {
          font-size: 12px;
          color: #68758f;
          text-transform: uppercase;
          font-weight: 700;
        }

        .overall-status {
          font-size: 22px;
          font-weight: 800;
          margin-top: 4px;
        }

        .summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 15px;
        }

        .summary-box {
          border: 1px solid #dfe4ee;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }

        .summary-box strong {
          display: block;
          font-size: 22px;
        }

        .summary-box span {
          color: #68758f;
          font-size: 11px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 12px;
        }

        th {
          background: #f1f4f9;
          text-align: left;
          font-weight: 700;
        }

        th,
        td {
          border: 1px solid #dfe4ee;
          padding: 9px;
          vertical-align: top;
        }

        .status-PASS {
          font-weight: 800;
        }

        .status-FAIL {
          font-weight: 800;
        }

        .status-INSUFFICIENT_DATA {
          font-weight: 800;
        }

        .action {
          border-left: 4px solid #4164e8;
          background: #f5f7fc;
          padding: 14px 16px;
          margin-top: 10px;
        }

        .documents {
          font-size: 13px;
        }

        .footer {
          margin-top: 35px;
          padding-top: 12px;
          border-top: 1px solid #dfe4ee;
          color: #68758f;
          font-size: 10px;
          text-align: center;
        }

        @media print {
          .no-print {
            display: none;
          }
        }

      </style>
    </head>

    <body>

      <div class="header">
        <div class="brand">NexVerifyAI</div>

        <h1 class="title">
          AI Procurement Compliance Verification Report
        </h1>

        <div class="subtitle">
          Automated document-based procurement compliance assessment
        </div>
      </div>


      <div class="section">

        <h2>Submission Information</h2>

        <div class="info-grid">

          <div class="info-item">
            <div class="label">Submission ID</div>
            <div class="value">
              ${submission.id || "N/A"}
            </div>
          </div>

          <div class="info-item">
            <div class="label">Bid ID</div>
            <div class="value">
              ${submission.bidId || "N/A"}
            </div>
          </div>

          <div class="info-item">
            <div class="label">Procurement</div>
            <div class="value">
              ${submission.bidTitle || "N/A"}
            </div>
          </div>

          <div class="info-item">
            <div class="label">Bidder</div>
            <div class="value">
              ${submission.bidderName || "Bidder User"}
            </div>
          </div>

          <div class="info-item">
            <div class="label">Submitted</div>
            <div class="value">
              ${
                submission.submittedAt
                  ? new Date(
                      submission.submittedAt
                    ).toLocaleString()
                  : "N/A"
              }
            </div>
          </div>

          <div class="info-item">
            <div class="label">Bidder Document</div>
            <div class="value">
              ${submission.bidderDocument || "N/A"}
            </div>
          </div>

          <div class="info-item">
            <div class="label">Tender Document</div>
            <div class="value">
              ${submission.tenderDocument || "N/A"}
            </div>
          </div>

        </div>

      </div>


      <div class="overall">

        <div class="overall-title">
          Overall Verification Status
        </div>

        <div class="overall-status">
          ${statusText}
        </div>

        <div class="summary">

          <div class="summary-box">
            <strong>${counts.passed}</strong>
            <span>Passed</span>
          </div>

          <div class="summary-box">
            <strong>${counts.failed}</strong>
            <span>Failed</span>
          </div>

          <div class="summary-box">
            <strong>${counts.review}</strong>
            <span>Review Required</span>
          </div>

        </div>

      </div>


      <div class="section">

        <h2>Compliance Assessment</h2>

        <table>

          <thead>
            <tr>
              <th style="width: 32%;">
                Requirement
              </th>

              <th style="width: 18%;">
                Status
              </th>

              <th>
                Details
              </th>
            </tr>
          </thead>

          <tbody>
            ${
              checkRows ||
              `
                <tr>
                  <td colspan="3">
                    No detailed compliance checks available.
                  </td>
                </tr>
              `
            }
          </tbody>

        </table>

      </div>


      <div class="section">

        <h2>Officer Action</h2>

        <div class="action">
          ${officerAction}
        </div>

      </div>


      <div class="section documents">

        <h2>Verification Documents</h2>

        <p>
          <strong>Tender Requirement:</strong>
          ${submission.tenderDocument || "N/A"}
        </p>

        <p>
          <strong>Bidder Submission:</strong>
          ${submission.bidderDocument || "N/A"}
        </p>

      </div>


      <div class="footer">
        Generated by NexVerifyAI Procurement Compliance System.
        <br />
        This report is generated from the documents and verification
        results available at the time of assessment.
      </div>

    </body>
    </html>
  `);

  reportWindow.document.close();
  reportWindow.focus();

  setTimeout(() => {
    reportWindow.print();
  }, 500);
};

  

  return (
    <div className="reports-page">

      <div className="reports-header">
        <div>
          <h1>Verification Reports</h1>
          <p>
            Review bidder compliance results and generate official reports.
          </p>
        </div>

        <button
          className="reports-refresh"
          onClick={() => {
            const saved = JSON.parse(
              localStorage.getItem("nexverify_submissions") || "[]"
            );

            setSubmissions(saved);
          }}
        >
          Refresh
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="reports-empty">
          <h2>No verification reports yet</h2>
          <p>
            Reports will appear here after a bidder submits documents
            for verification.
          </p>
        </div>
      ) : (
        <div className="reports-list">

          {submissions
            .slice()
            .reverse()
            .map((submission) => {
              const status = getStatus(submission);
              const counts = getCounts(submission);

              return (
                <div
                  className="report-card"
                  key={submission.id}
                >

                  <div className="report-card-header">

                    <div>
                      <span className="report-bid-id">
                        {submission.bidId}
                      </span>

                      <h2>
                        {submission.bidTitle}
                      </h2>

                      <p>
                        Bidder:{" "}
                        <strong>
                          {submission.bidderName || "Bidder User"}
                        </strong>
                      </p>
                    </div>

                    <span className={statusClass(status)}>
                      {status}
                    </span>

                  </div>

                  <div className="report-summary">

                    <div>
                      <span>Passed</span>
                      <strong>{counts.passed}</strong>
                    </div>

                    <div>
                      <span>Failed</span>
                      <strong>{counts.failed}</strong>
                    </div>

                    <div>
                      <span>Review</span>
                      <strong>{counts.review}</strong>
                    </div>

                  </div>

                  <div className="report-documents">

  <p>
    <strong>Bidder Document:</strong>{" "}
    {submission.bidderDocument || "N/A"}
  </p>

  <p>
    <strong>Tender Document:</strong>{" "}
    {submission.tenderDocument || "N/A"}
  </p>

  <p>
    <strong>Submitted:</strong>{" "}
    {submission.submittedAt
      ? new Date(
          submission.submittedAt
        ).toLocaleString()
      : "N/A"}
  </p>

</div>

<div className="report-checks">

  <h3>Compliance Assessment</h3>

  {getChecks(submission).map((check, index) => {
    const name =
      check.name ||
      check.field ||
      check.requirement ||
      `Compliance Check ${index + 1}`;

    const status =
      check.status ||
      check.result ||
      "REVIEW_REQUIRED";

    const normalized =
      String(status).toUpperCase();

    return (
      <div
        className="report-check-row"
        key={`${name}-${index}`}
      >
        <span>{name}</span>

        <strong
          className={
            normalized === "PASS"
              ? "report-check-pass"
              : normalized === "FAIL"
              ? "report-check-fail"
              : "report-check-review"
          }
        >
          {normalized === "PASS"
            ? "✓ PASS"
            : normalized === "FAIL"
            ? "✕ FAIL"
            : "⚠ REVIEW"}
        </strong>
      </div>
    );
  })}

</div>

<button
  className="report-download"
  onClick={() =>
    downloadReport(submission)
  }
>
  Download Verification Report
</button>

                </div>
              );
            })}

        </div>
      )}

    </div>
  );
}