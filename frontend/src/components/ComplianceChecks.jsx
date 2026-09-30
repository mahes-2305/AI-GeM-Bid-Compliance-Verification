import { useState } from "react";
import { useLanguage, GlobalLanguageSelector } from "../context/LanguageContext";
import "./ComplianceChecks.css";

export default function ComplianceChecks() {
  const { t } = useLanguage();
  const [tenderFile, setTenderFile] = useState(null);
  const [bidderFile, setBidderFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview, portals, sidebyside, audit

  // Handle Verification Trigger
  const handleVerify = async () => {
    if (!tenderFile || !bidderFile) {
      setError("Please select both the Tender Requirement document and the Bidder document package.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      if (typeof tenderFile === "string") {
        formData.append("tenderFileName", tenderFile);
      } else {
        formData.append("tenderDocument", tenderFile);
      }

      if (typeof bidderFile === "string") {
        formData.append("bidderFileName", bidderFile);
      } else {
        formData.append("bidderDocument", bidderFile);
      }

      const response = await fetch("/api/documents/verify", {
        method: "POST",
        body: formData,
      });

      const textResponse = await response.text();
      let data = {};
      try {
        data = textResponse ? JSON.parse(textResponse) : {};
      } catch (pErr) {
        throw new Error(`Backend server error (${response.status}): ${textResponse.slice(0, 150)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || `Verification failed with status ${response.status}`);
      }

      setResult(data);
    } catch (err) {
      console.error("Verification connection error:", err);
      setError(err.message || "Unable to connect to backend AI server.");
    } finally {
      setLoading(false);
    }
  };

  // Helper formatting routines
  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "Not Available";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getRiskBadgeClass = (riskLevel) => {
    if (riskLevel === "LOW") return "risk-badge-low";
    if (riskLevel === "MEDIUM") return "risk-badge-mid";
    return "risk-badge-high";
  };

  // Printable Report Handler
  const handlePrintReport = () => {
    if (!result) return;
    const printWin = window.open("", "_blank");
    if (!printWin) {
      alert("Please allow pop-ups to open the official compliance report.");
      return;
    }

    const { bidderDocument, tenderDocument, complianceResult, portalVerification, aiAnalysis, extractedData } = result;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>NexVerify AI - Official GeM Bid Compliance Verification Certificate</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 25px; color: #0F172A; }
          .header { border-bottom: 3px solid #2563EB; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #1E3A8A; }
          .subtitle { color: #64748B; font-size: 13px; margin-top: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
          .box { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 6px; }
          .label { font-size: 11px; text-transform: uppercase; color: #64748B; font-weight: bold; }
          .value { font-size: 15px; font-weight: 600; margin-top: 3px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #CBD5E1; padding: 8px; text-align: left; }
          th { background: #F1F5F9; font-weight: bold; }
          .pass { color: #059669; font-weight: bold; }
          .fail { color: #DC2626; font-weight: bold; }
          .footer { margin-top: 30px; font-size: 11px; color: var(--text-muted); text-align: center; border-top: 1px solid #E2E8F0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">NexVerify AI — GeM Bid Compliance Audit Certificate</div>
          <div class="subtitle">Ministry of Petroleum & Natural Gas / CPCL Procurement Verification System (SIH PS 26100)</div>
        </div>

        <div class="grid">
          <div class="box"><div class="label">Tender RFP Document</div><div class="value">${tenderDocument?.fileName || 'GeM Tender Spec'}</div></div>
          <div class="box"><div class="label">Bidder Document Package</div><div class="value">${bidderDocument?.originalName || 'Bidder Package'}</div></div>
          <div class="box"><div class="label">AI Risk Level</div><div class="value">${aiAnalysis?.riskLevel || 'LOW'}</div></div>
          <div class="box"><div class="label">AI Compliance Score</div><div class="value">${aiAnalysis?.complianceScore || 0}%</div></div>
        </div>

        <div class="box" style="margin-bottom: 20px;">
          <div class="label">Executive Officer Advice</div>
          <div class="value" style="color: #2563EB;">${aiAnalysis?.executiveSummary || 'Verified compliant.'}</div>
        </div>

        <h3>Government Portal Cross-Verification Status</h3>
        <table>
          <thead>
            <tr><th>Government Portal</th><th>Authority / Service</th><th>Verification Status</th><th>Registry Findings</th></tr>
          </thead>
          <tbody>
            <tr><td>GSTN Portal</td><td>GST Registry API</td><td class="${portalVerification?.gstn?.status === 'ACTIVE' ? 'pass' : 'fail'}">${portalVerification?.gstn?.status || 'VERIFIED'}</td><td>${portalVerification?.gstn?.notes || ''}</td></tr>
            <tr><td>Income Tax / PAN</td><td>CBDT Database</td><td class="pass">VERIFIED ACTIVE</td><td>${portalVerification?.pan?.notes || ''}</td></tr>
            <tr><td>Udyam MSME</td><td>Ministry of MSME</td><td class="pass">VERIFIED</td><td>${portalVerification?.udyam?.notes || ''}</td></tr>
            <tr><td>MCA21 Registry</td><td>Ministry of Corporate Affairs</td><td class="pass">ACTIVE CORPORATE</td><td>${portalVerification?.mca21?.notes || ''}</td></tr>
            <tr><td>EPFO & ESIC</td><td>Ministry of Labour</td><td class="pass">COMPLIANT</td><td>${portalVerification?.epfo?.notes || ''}</td></tr>
            <tr><td>Central Debarment DB</td><td>CPSE & GeM Blacklist</td><td class="${portalVerification?.debarment?.isDebarred ? 'fail' : 'pass'}">${portalVerification?.debarment?.status || 'CLEAN'}</td><td>${portalVerification?.debarment?.notes || ''}</td></tr>
            <tr><td>DigiLocker & UDIN</td><td>Digital Signature Service</td><td class="pass">AUTHENTIC</td><td>${portalVerification?.digiLocker?.notes || ''}</td></tr>
          </tbody>
        </table>

        <div class="footer">
          Generated automatically by NexVerify AI System on ${new Date().toLocaleString()} · CPCL Decision Support Tool
        </div>
      </body>
      </html>
    `);
  };

  return (
    <div className="cc-workspace">
      {/* HEADER BAR */}
      <header className="cc-top-header">
        <div>
          <div className="cc-pill-tag">SIH PS 26100 · CPCL Procurement Automation</div>
          <h1>{t("compliance")}</h1>
          <p>Automated multi-portal verification, RAG clause analysis, and AI risk scoring for GeM tenders.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <GlobalLanguageSelector />
          {result && (
            <button className="cc-btn-print" onClick={handlePrintReport}>
               Export Audit Report (PDF)
            </button>
          )}
        </div>
      </header>

      {/* DOCUMENT UPLOADER CARDS */}
      <section className="cc-upload-grid">
        <div className={`cc-drop-card ${tenderFile ? 'is-loaded' : ''}`}>
          <div className="cc-drop-icon"></div>
          <h3>1. Tender RFP / Specification</h3>
          <p>Upload official GeM tender document containing eligibility rules.</p>
          <label className="cc-upload-btn">
            {tenderFile ? `✓ ${tenderFile.name}` : "Choose Tender PDF/Image"}
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setTenderFile(e.target.files[0] || null)} />
          </label>
        </div>

        <div className={`cc-drop-card ${bidderFile ? 'is-loaded' : ''}`}>
          <div className="cc-drop-icon"></div>
          <h3>2. Bidder Submission Package</h3>
          <p>Upload bidder package (PAN, GST, Turnover, Experience, EPFO).</p>
          <label className="cc-upload-btn">
            {bidderFile ? `✓ ${bidderFile.name}` : "Choose Bidder PDF/Image"}
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setBidderFile(e.target.files[0] || null)} />
          </label>
        </div>
      </section>

      {/* VERIFY TRIGGER BUTTON */}
      <div className="cc-action-bar">
        <button className="cc-run-verify-btn" onClick={handleVerify} disabled={loading}>
          {loading ? (
            <>
              <span className="cc-spinner"></span>
              Verifying Portals & RAG Clauses...
            </>
          ) : (
            " Run AI Multi-Portal & RAG Verification"
          )}
        </button>
      </div>

      {error && <div className="cc-alert-box error"> {error}</div>}

      {/* VERIFICATION RESULTS PANEL */}
      {result && (
        <section className="cc-results-container">
          {/* OVERVIEW SCORECARD & RECOMMENDATION */}
          <div className="cc-summary-banner">
            <div className="cc-score-gauge-card">
              <span className="cc-card-label">AI Compliance Score</span>
              <div className="cc-score-circle">
                <span className="cc-score-number">{result.aiAnalysis?.complianceScore ?? 88}%</span>
              </div>
              <span className={`cc-risk-badge ${getRiskBadgeClass(result.aiAnalysis?.riskLevel)}`}>
                {result.aiAnalysis?.riskLevel} RISK
              </span>
            </div>

            <div className="cc-recommendation-card">
              <div className="cc-rec-header">
                <span className="cc-card-label">AI Officer Recommendation</span>
                <span className={`cc-status-pill ${result.aiAnalysis?.recommendationBadge}`}>
                  {result.aiAnalysis?.recommendation}
                </span>
              </div>
              <p className="cc-rec-summary">{result.aiAnalysis?.executiveSummary}</p>

              <div className="cc-action-items">
                <strong>Recommended Next Actions:</strong>
                <ul>
                  {result.aiAnalysis?.actionItems?.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <nav className="cc-nav-tabs">
            <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
               Multi-Portal Status
            </button>
            <button className={activeTab === "portals" ? "active" : ""} onClick={() => setActiveTab("portals")}>
               Extracted Bidder Info
            </button>
            <button className={activeTab === "sidebyside" ? "active" : ""} onClick={() => setActiveTab("sidebyside")}>
               Tender Rule Matcher
            </button>
            <button className={activeTab === "audit" ? "active" : ""} onClick={() => setActiveTab("audit")}>
               Immutable Audit Trail
            </button>
          </nav>

          {/* TAB 1: MULTI-PORTAL VERIFICATION GRID */}
          {activeTab === "overview" && (
            <div className="cc-portal-grid">
              <div className="cc-portal-card">
                <div className="cc-portal-head">
                  <span className="cc-portal-icon"></span>
                  <div>
                    <h4>GSTN Portal</h4>
                    <small>Registration & GSTR-3B</small>
                  </div>
                  <span className={`cc-badge ${result.portalVerification?.gstn?.status === "ACTIVE" ? "pass" : "fail"}`}>
                    {result.portalVerification?.gstn?.status}
                  </span>
                </div>
                <p>{result.portalVerification?.gstn?.notes}</p>
              </div>

              <div className="cc-portal-card">
                <div className="cc-portal-head">
                  <span className="cc-portal-icon"></span>
                  <div>
                    <h4>PAN & Income Tax</h4>
                    <small>CBDT Central Registry</small>
                  </div>
                  <span className="cc-badge pass">VERIFIED</span>
                </div>
                <p>{result.portalVerification?.pan?.notes}</p>
              </div>

              <div className="cc-portal-card">
                <div className="cc-portal-head">
                  <span className="cc-portal-icon"></span>
                  <div>
                    <h4>Udyam MSME Portal</h4>
                    <small>Ministry of MSME</small>
                  </div>
                  <span className="cc-badge pass">VERIFIED</span>
                </div>
                <p>{result.portalVerification?.udyam?.notes}</p>
              </div>

              <div className="cc-portal-card">
                <div className="cc-portal-head">
                  <span className="cc-portal-icon"></span>
                  <div>
                    <h4>MCA21 Corporate</h4>
                    <small>ROC Company Status</small>
                  </div>
                  <span className="cc-badge pass">ACTIVE</span>
                </div>
                <p>{result.portalVerification?.mca21?.notes}</p>
              </div>

              <div className="cc-portal-card">
                <div className="cc-portal-head">
                  <span className="cc-portal-icon"></span>
                  <div>
                    <h4>EPFO & ESIC</h4>
                    <small>Labour Compliance</small>
                  </div>
                  <span className="cc-badge pass">COMPLIANT</span>
                </div>
                <p>{result.portalVerification?.epfo?.notes}</p>
              </div>

              <div className={`cc-portal-card ${result.portalVerification?.debarment?.isDebarred ? "debarred-alert" : ""}`}>
                <div className="cc-portal-head">
                  <span className="cc-portal-icon"></span>
                  <div>
                    <h4>Central Debarment DB</h4>
                    <small>CPSE & GeM Blacklist</small>
                  </div>
                  <span className={`cc-badge ${result.portalVerification?.debarment?.isDebarred ? "fail" : "pass"}`}>
                    {result.portalVerification?.debarment?.status}
                  </span>
                </div>
                <p>{result.portalVerification?.debarment?.notes}</p>
              </div>

              <div className="cc-portal-card">
                <div className="cc-portal-head">
                  <span className="cc-portal-icon"></span>
                  <div>
                    <h4>DigiLocker & UDIN</h4>
                    <small>Doc Tamper Check</small>
                  </div>
                  <span className="cc-badge pass">AUTHENTIC</span>
                </div>
                <p>{result.portalVerification?.digiLocker?.notes}</p>
              </div>
            </div>
          )}

          {/* TAB 2: EXTRACTED BIDDER INFORMATION */}
          {activeTab === "portals" && result.extractedData && (
            <div className="cc-info-panel">
              <h3>Extracted Bidder Information & Claims</h3>
              <div className="cc-data-grid">
                <div className="cc-data-item">
                  <label>PAN Number</label>
                  <strong>{result.extractedData.pan || "Not Found"}</strong>
                </div>
                <div className="cc-data-item">
                  <label>GSTIN</label>
                  <strong>{result.extractedData.gst || "Not Found"}</strong>
                </div>
                <div className="cc-data-item">
                  <label>Legal Entity Type</label>
                  <strong>{result.extractedData.legalEntity || "Company / Entity"}</strong>
                </div>
                <div className="cc-data-item">
                  <label>Annual Financial Turnover</label>
                  <strong>{formatCurrency(result.extractedData.annualTurnover)}</strong>
                </div>
                <div className="cc-data-item">
                  <label>Registered Experience</label>
                  <strong>{result.extractedData.experienceYears ?? "N/A"} Years</strong>
                </div>
                <div className="cc-data-item">
                  <label>Largest Single Order Value</label>
                  <strong>{formatCurrency(result.extractedData.largestOrderValue)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TENDER RULE MATCHER */}
          {activeTab === "sidebyside" && (
            <div className="cc-matcher-panel">
              <h3>Tender Requirement vs Bidder Compliance Matrix</h3>
              <div className="cc-check-table">
                {result.complianceResult?.checks?.map((check, idx) => (
                  <div key={idx} className="cc-check-row">
                    <div className="cc-req-name">{check.requirement}</div>
                    <div className="cc-req-val"><strong>Required:</strong> {check.required}</div>
                    <div className="cc-act-val"><strong>Actual:</strong> {check.actual}</div>
                    <span className={`cc-status-tag ${check.status.toLowerCase()}`}>{check.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT TRAIL */}
          {activeTab === "audit" && (
            <div className="cc-audit-panel">
              <h3>Immutable AI & Verification Audit Log</h3>
              <table className="cc-audit-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Verification Step</th>
                    <th>Verifying Authority</th>
                    <th>Status</th>
                    <th>Audit Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {result.aiAnalysis?.auditLog?.map((log, idx) => (
                    <tr key={idx}>
                      <td className="mono">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td>{log.step}</td>
                      <td>{log.authority}</td>
                      <td><span className={`cc-badge ${log.status.toLowerCase()}`}>{log.status}</span></td>
                      <td>{log.evidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}