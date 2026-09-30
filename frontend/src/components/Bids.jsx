import { useEffect, useState } from "react";
import "./Bids.css";

const DEFAULT_BIDS = [
  {
    id: "BID-001",
    title: "Civil & Renovation Works",
    description: "Renovation of administrative blocks and structural maintenance",
    category: "Construction",
  },
  {
    id: "BID-002",
    title: "IT Hardware & Server Procurement",
    description: "Supply of high-performance servers, networking hardware and IT infrastructure",
    category: "Technology",
  },
  {
    id: "BID-003",
    title: "Medical & Safety Equipment",
    description: "Supply and installation of industrial safety gear and medical first-aid stations",
    category: "Healthcare",
  },
  {
    id: "BID-004",
    title: "Electrical & Substation Works",
    description: "Electrical installation, transformer maintenance and grid infrastructure",
    category: "Electrical",
  },
  {
    id: "BID-005",
    title: "Logistics & Transport Services",
    description: "Fleet transportation and logistics management for refinery operations",
    category: "Logistics",
  },
];

export default function Bids() {
  const [bids, setBids] = useState(() => {
    const saved = localStorage.getItem("nexverify_bids");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse bids from localStorage", e);
        return DEFAULT_BIDS;
      }
    }
    return DEFAULT_BIDS;
  });
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("nexverify_bids", JSON.stringify(bids));
  }, [bids]);

  // Fetch real-time verified submissions from backend persistent store
  const fetchBackendSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents/submissions");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.warn("Could not fetch backend submissions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendSubmissions();
  }, []);

  const handleRequirementUpload = async (bidId, file) => {
    if (!file) return;

    try {
      setMessage(`Uploading requirement document for ${bidId}...`);
      const formData = new FormData();
      formData.append("document", file);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload requirement document");
      }

      const updated = bids.map((bid) =>
        bid.id === bidId
          ? {
            ...bid,
            requirementDocument: {
              name: file.name,
              size: file.size,
              type: file.type,
              savedAt: new Date().toISOString(),
              backendFileName: data.file?.fileName || "",
            },
          }
          : bid
      );

      setBids(updated);
      setMessage(` Requirement document attached successfully to ${bidId}.`);
      setTimeout(() => setMessage(""), 3500);
    } catch (error) {
      setMessage(` Upload failed: ${error.message}`);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  return (
    <div className="bids-page">
      <div className="bids-header">
        <div>
          <h1>GeM Procurement Opportunities & Live Submissions</h1>
          <p>Real-time synchronization with CPCL/GeM backend bid verification database.</p>
        </div>
        <button
          onClick={fetchBackendSubmissions}
          style={{
            padding: "8px 16px",
            background: "#2563eb",
            color: "var(--text-main)",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer"
          }}
        >
           Refresh Live Bids
        </button>
      </div>

      {message && <div className="bids-message">{message}</div>}

      <div className="bids-summary">
        <div>
          <span>Active Opportunities</span>
          <strong>{bids.length}</strong>
        </div>
        <div>
          <span>Verified Submissions</span>
          <strong>{submissions.length}</strong>
        </div>
        <div>
          <span>Server Status</span>
          <strong style={{ color: "#34d399" }}>● Connected</strong>
        </div>
      </div>

      {/* LIVE VERIFIED SUBMISSIONS TABLE */}
      {submissions.length > 0 && (
        <div style={{ marginBottom: "32px", background: "var(--bg-surface)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "18px", color: "var(--text-main)", marginBottom: "12px" }}>
             Live Verified Bidder Submissions (Backend Storage)
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--text-main)", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.1)", textAlign: "left" }}>
                  <th style={{ padding: "10px" }}>Submission ID</th>
                  <th style={{ padding: "10px" }}>Bidder Enterprise</th>
                  <th style={{ padding: "10px" }}>Tender Reference</th>
                  <th style={{ padding: "10px" }}>AI Compliance Score</th>
                  <th style={{ padding: "10px" }}>Risk Rating</th>
                  <th style={{ padding: "10px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}>
                    <td style={{ padding: "10px", fontWeight: "600", color: "#60a5fa" }}>{sub.id}</td>
                    <td style={{ padding: "10px" }}>{sub.bidderName}</td>
                    <td style={{ padding: "10px" }}>{sub.tenderId}</td>
                    <td style={{ padding: "10px", fontWeight: "700", color: sub.complianceScore >= 80 ? "#34d399" : "#f59e0b" }}>
                      {sub.complianceScore}%
                    </td>
                    <td style={{ padding: "10px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: "700",
                        background: sub.riskLevel === "LOW" ? "rgba(52, 211, 153, 0.2)" : "rgba(245, 158, 11, 0.2)",
                        color: sub.riskLevel === "LOW" ? "#34d399" : "#f59e0b"
                      }}>
                        {sub.riskLevel}
                      </span>
                    </td>
                    <td style={{ padding: "10px", fontWeight: "600" }}>{sub.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PROCUREMENT OPPORTUNITIES GRID */}
      <h2 style={{ fontSize: "18px", color: "var(--text-main)", marginBottom: "16px" }}>Procurement Opportunity List</h2>
      <div className="bids-grid">
        {bids.map((bid) => (
          <div className="bid-card" key={bid.id}>
            <div className="bid-card-top">
              <span className="bid-id">{bid.id}</span>
              <span className="bid-category">{bid.category}</span>
            </div>

            <h2>{bid.title}</h2>
            <p>{bid.description}</p>

            <div className="bid-requirement">
              <div>
                <strong>Requirement Document</strong>
                {bid.requirementDocument ? (
                  <span className="uploaded">✓ {bid.requirementDocument.name}</span>
                ) : (
                  <span className="not-uploaded">No document attached</span>
                )}
              </div>

              <label className="upload-btn">
                {bid.requirementDocument ? "Replace" : "Upload"}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) => handleRequirementUpload(bid.id, event.target.files[0])}
                />
              </label>
            </div>

            <div className="bid-card-footer">
              <span className="active-status">● Active</span>
              <span>Open for submissions</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}