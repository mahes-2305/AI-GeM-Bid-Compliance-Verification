import { useEffect, useState } from "react";
import { useLanguage, GlobalLanguageSelector } from "../context/LanguageContext";
import ProcurementAssistant from "./ProcurementAssistant";
import "./BidderDashboard.css";

const STORAGE_KEY = "nexverify_bids";

function BidderDashboard({ userName = "Bidder User", onLogout }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("bids");
  const [bids, setBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [mySubmissions, setMySubmissions] = useState([]);
  const [myNotifications, setMyNotifications] = useState([]);

  // Load bids created by the procurement officer
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setBids(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load bids:", error);
        setBids([]);
      }
    }

    // Load my submissions natively from API
    const fetchMySubmissions = async () => {
      try {
        const res = await fetch("/api/documents/submissions");
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.submissions)) {
          setMySubmissions(data.submissions.filter(s => s.bidderName === userName));
        }
      } catch (err) {
        console.error("Failed to load submissions", err);
      }
    };
    fetchMySubmissions();

    // Load notifications
    try {
      const notifs = JSON.parse(localStorage.getItem("nexverify_notifications") || "[]");
      setMyNotifications(notifs); // Show all notifications for demo visibility
    } catch (err) { }
  }, [userName]);

  // Select bidder documents
  const handleDocuments = (event) => {
    setDocuments(Array.from(event.target.files || []));
    setVerificationResult(null);
  };

  // Submit bidder document for real verification
  const submitBid = async () => {
    console.log("Submit button clicked");

    if (!selectedBid) {
      setVerificationMessage("Please select a bid first.");
      return;
    }

    if (documents.length === 0) {
      setVerificationMessage("Please upload the required documents.");
      return;
    }

    const tenderFileName =
      selectedBid.requirementDocument?.backendFileName;

    console.log("Selected bid:", selectedBid);
    console.log("Tender file:", tenderFileName);
    console.log("Bidder file:", documents[0]?.name);

    if (!tenderFileName) {
      setVerificationMessage(
        "Requirement document is not available for this bid."
      );
      return;
    }

    try {
      setIsVerifying(true);
      setVerificationResult(null);
      setVerificationMessage("Uploading documents for verification...");

      const formData = new FormData();

      formData.append("bidderDocument", documents[0]);
      formData.append("tenderFileName", tenderFileName);

      setVerificationMessage("AI is verifying the bid...");

      const response = await fetch(
        "/api/documents/verify",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("Backend response:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Verification failed"
        );
      }

      setVerificationResult(data);
      // Backend automatically saves this securely across sessions, optionally push to local state to refresh UI immediately
      setMySubmissions(prev => [
        {
          id: data.savedRecord?.id || `SUB-${Date.now()}`,
          bidId: selectedBid.id,
          bidTitle: selectedBid.title,
          bidderName: userName,
          submittedAt: new Date().toISOString(),
          bidderDocument: documents[0].name,
          tenderDocument: selectedBid.requirementDocument?.name || "Requirement Document",
          overallStatus: data.complianceResult?.overallStatus || data.complianceResult?.status || "REVIEW_REQUIRED",
          complianceResult: data.complianceResult,
          extractedData: data.extractedData,
          requirements: data.requirements,
        },
        ...prev
      ]);

      setVerificationMessage("Verification completed successfully.");
    } catch (error) {
      console.error("Verification error:", error);

      setVerificationMessage(
        `Verification failed: ${error.message}`
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Get compliance checks safely
  const getChecks = () => {
    const result = verificationResult?.complianceResult;

    if (!result) {
      return [];
    }

    if (Array.isArray(result.details)) {
      return result.details;
    }

    if (Array.isArray(result.checks)) {
      return result.checks;
    }

    if (
      result.details &&
      typeof result.details === "object"
    ) {
      return Object.entries(result.details).map(
        ([key, value]) => ({
          name: key,
          ...(typeof value === "object"
            ? value
            : { status: value }),
        })
      );
    }

    return [];
  };

  const checks = getChecks();

  return (
    <div className="bidder-shell">
      {/* SIDEBAR */}
      <aside className="bidder-sidebar">
        <div className="bidder-logo">
          <img src="/nexverify-logo.png" alt="NexVerify AI" style={{ height: "40px" }} />
          <span className="db-logo-text">NexVerify<em>AI</em></span>
        </div>

        <nav>
          <button
            className={activeTab === "bids" ? "bidder-nav-active" : ""}
            onClick={() => setActiveTab("bids")}
          >
            {t("availableBids")}
          </button>

          <button
            className={activeTab === "submissions" ? "bidder-nav-active" : ""}
            onClick={() => setActiveTab("submissions")}
          >
            {t("mySubmissions")}
          </button>

          <button
            className={activeTab === "ai" ? "bidder-nav-active" : ""}
            onClick={() => setActiveTab("ai")}
          >
            {t("assistant")}
          </button>
        </nav>

        <div className="bidder-profile">
          <div className="bidder-profile-info">
            <div className="bidder-avatar">
              BU
            </div>

            <div>
              <strong>{userName}</strong>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)' }}>Bidder</span>
            </div>
          </div>

          <button
            className="bidder-logout"
            onClick={onLogout}
          >
            {t("logout")}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="bidder-main">

        {/* HEADER */}
        <header className="bidder-header">
          <div>
            <h1>{t("availableBids")}</h1>

            <p>
              Select a procurement opportunity and submit
              your documents.
            </p>
          </div>

          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <button
              className="bidder-header-logout"
              onClick={onLogout}
            >
              {t("logout")}
            </button>
          </div>
        </header>

        {/* STATISTICS */}
        {myNotifications.length > 0 && (
          <div style={{ padding: "15px", background: "rgba(16, 185, 129, 0.2)", border: "1px solid #34d399", color: "#34d399", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold" }}>
            {myNotifications[myNotifications.length - 1].message}
          </div>
        )}
        {activeTab === "ai" ? (
          <ProcurementAssistant />
        ) : activeTab === "bids" ? (
          <>
            <section className="bidder-stats">
              <div>
                <span>{t("activeBids")}</span>
                <strong>{bids.length}</strong>
              </div>

              <div>
                <span>{t("mySubmissions")}</span>
                <strong>
                  {mySubmissions.length}
                </strong>
              </div>

              <div>
                <span>{t("documentsUploaded")}</span>
                <strong>{documents.length}</strong>
              </div>
            </section>

            {/* BIDS */}
            <section className="bidder-bids">
              {bids.map((bid) => (
                <div
                  className={`bidder-card ${selectedBid?.id === bid.id
                    ? "bidder-card-selected"
                    : ""
                    }`}
                  key={bid.id}
                >
                  <div className="bidder-card-top">
                    <span>{bid.id}</span>
                    <small>{bid.category}</small>
                  </div>

                  <h2>{bid.title}</h2>
                  <p>{bid.description}</p>

                  <div className="bidder-deadline">
                    Submission deadline:{" "}
                    <strong>
                      {bid.deadline || "Not specified"}
                    </strong>
                  </div>

                  {bid.requirementDocument && (
                    <div className="bidder-requirement">
                      ✓ Requirement document available
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedBid(bid);
                      setDocuments([]);
                      setVerificationResult(null);
                    }}
                    className="bidder-select-button"
                  >
                    {selectedBid?.id === bid.id
                      ? t("selected")
                      : t("selectBid")}
                  </button>
                </div>
              ))}
            </section>

            {/* DOCUMENT UPLOAD */}
            {selectedBid && (
              <section className="bidder-upload">
                <div>
                  <h2>
                    Submit Documents — {selectedBid.id}
                  </h2>

                  <p>
                    Upload the documents required for this
                    procurement opportunity.
                  </p>
                </div>

                <input
                  id="bid-documents"
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleDocuments}
                />

                {documents.length > 0 && (
                  <div className="bidder-files">
                    {documents.map((file) => (
                      <div key={file.name}>
                        ✓ {file.name}
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="bidder-submit-button"
                  onClick={() => submitBid()}
                  disabled={isVerifying}
                >
                  {isVerifying
                    ? "Verifying..."
                    : "Submit Bid for Verification"}
                </button>
              </section>
            )}

            {verificationMessage && (
              <div className="verification-message">
                {verificationMessage}
              </div>
            )}
          </>
        ) : (
          <section className="bidder-submissions" style={{ padding: "20px" }}>
            <h2>{t("mySubmissions")}</h2>
            {mySubmissions.length === 0 ? (
              <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>No submissions found for your account.</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
                {mySubmissions.map(sub => (
                  <li key={sub.id} style={{ background: "var(--bg-surface)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0, 0, 0, 0.1)", marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong style={{ fontSize: "16px", color: "var(--text-main)" }}>{sub.bidId} - {sub.bidTitle}</strong>
                      <span style={{ fontWeight: "700", color: sub.overallStatus === "COMPLIANT" ? "#34d399" : "#f59e0b" }}>{sub.overallStatus}</span>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0" }}>Submitted: {new Date(sub.submittedAt).toLocaleString()}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0" }}>Document attached: {sub.bidderDocument}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default BidderDashboard;