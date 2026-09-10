import { useState } from "react";
import "./ComplianceChecks.css";

export default function ComplianceChecks() {
  const [tenderFile, setTenderFile] = useState(null);
  const [bidderFile, setBidderFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!tenderFile || !bidderFile) {
      setError("Please select both tender and bidder documents.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();

      formData.append("tenderDocument", tenderFile);
      formData.append("bidderDocument", bidderFile);

      const response = await fetch(
        "http://localhost:5000/api/documents/verify",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setResult(data);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "PASS") return "cc-pass";
    if (status === "FAIL") return "cc-fail";
    return "cc-review";
  };

  const formatStatus = (status) => {
    if (status === "PASS") return "Passed";
    if (status === "FAIL") return "Failed";
    return "Review Required";
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return "Not available";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="cc-page">
      <div className="cc-header">
        <div>
          <h1>Compliance Verification</h1>
          <p>
            Upload the tender and bidder documents to automatically verify
            compliance.
          </p>
        </div>
      </div>

      {/* ================= DOCUMENT UPLOAD ================= */}

      <section className="cc-upload-grid">
        <div className="cc-upload-card">
          <div className="cc-upload-icon">📄</div>

          <h2>Tender Document</h2>

          <p>
            Upload the tender / GeM bid document containing the requirements.
          </p>

          <label className="cc-file-label">
            {tenderFile ? "Change Tender Document" : "Choose Tender Document"}

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                setTenderFile(e.target.files[0] || null);
                setResult(null);
                setError("");
              }}
            />
          </label>

          {tenderFile && (
            <div className="cc-file-name">
              ✓ {tenderFile.name}
            </div>
          )}
        </div>

        <div className="cc-upload-card">
          <div className="cc-upload-icon">📋</div>

          <h2>Bidder Document</h2>

          <p>
            Upload the bidder's submitted documents for verification.
          </p>

          <label className="cc-file-label">
            {bidderFile ? "Change Bidder Document" : "Choose Bidder Document"}

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                setBidderFile(e.target.files[0] || null);
                setResult(null);
                setError("");
              }}
            />
          </label>

          {bidderFile && (
            <div className="cc-file-name">
              ✓ {bidderFile.name}
            </div>
          )}
        </div>
      </section>

      {/* ================= VERIFY BUTTON ================= */}

      <div className="cc-action">
        <button
          className="cc-verify-btn"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying Documents..." : "Verify Documents"}
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="cc-error">
          ⚠ {error}
        </div>
      )}

      {/* ================= RESULT ================= */}

      {result && result.complianceResult && (
        <section className="cc-result">

          <div className="cc-result-header">
            <div>
              <h2>Verification Result</h2>
              <p>
                {result.tenderDocument?.originalName} vs{" "}
                {result.bidderDocument?.originalName}
              </p>
            </div>

            <div
              className={`cc-overall ${
                result.complianceResult.overallStatus === "COMPLIANT"
                  ? "cc-overall-pass"
                  : result.complianceResult.overallStatus ===
                    "NON-COMPLIANT"
                  ? "cc-overall-fail"
                  : "cc-overall-review"
              }`}
            >
              {result.complianceResult.overallStatus}
            </div>
          </div>

          {/* SUMMARY */}

          <div className="cc-summary">

            <div className="cc-summary-card">
              <span>Passed</span>
              <strong>
                {result.complianceResult.passedCount}
              </strong>
            </div>

            <div className="cc-summary-card">
              <span>Failed</span>
              <strong>
                {result.complianceResult.failedCount}
              </strong>
            </div>

            <div className="cc-summary-card">
              <span>Review Required</span>
              <strong>
                {result.complianceResult.reviewCount}
              </strong>
            </div>

          </div>

          {/* BIDDER INFORMATION */}

          {result.extractedData && (
            <div className="cc-panel">
              <div className="cc-panel-title">
                <h2>Extracted Bidder Information</h2>
              </div>

              <div className="cc-info-grid">

                <div>
                  <span>PAN</span>
                  <strong>{result.extractedData.pan || "Not found"}</strong>
                </div>

                <div>
                  <span>GSTIN</span>
                  <strong>{result.extractedData.gst || "Not found"}</strong>
                </div>

                <div>
                  <span>Legal Entity</span>
                  <strong>
                    {result.extractedData.legalEntity || "Not found"}
                  </strong>
                </div>

                <div>
                  <span>Annual Turnover</span>
                  <strong>
                    {formatCurrency(result.extractedData.annualTurnover)}
                  </strong>
                </div>

                <div>
                  <span>Experience</span>
                  <strong>
                    {result.extractedData.experienceYears ?? "Not found"} years
                  </strong>
                </div>

                <div>
                  <span>Similar Work Orders</span>
                  <strong>
                    {result.extractedData.similarWorkOrders ?? "Not found"}
                  </strong>
                </div>

                <div>
                  <span>Largest Order Value</span>
                  <strong>
                    {formatCurrency(result.extractedData.largestOrderValue)}
                  </strong>
                </div>

                <div>
                  <span>Debarred</span>
                  <strong>
                    {result.extractedData.debarred === null
                      ? "Not available"
                      : result.extractedData.debarred
                      ? "Yes"
                      : "No"}
                  </strong>
                </div>

              </div>
            </div>
          )}

          {/* COMPLIANCE CHECKS */}

          {result.complianceResult.details && (
            <div className="cc-panel">
              <div className="cc-panel-title">
                <h2>Compliance Checks</h2>
              </div>

              <div className="cc-check-list">

                {Object.entries(result.complianceResult.details).map(
                  ([key, check]) => (
                    <div className="cc-check-row" key={key}>

                      <div className="cc-check-name">
                        {key}
                      </div>

                      <div
                        className={`cc-status ${getStatusClass(
                          check.status
                        )}`}
                      >
                        {formatStatus(check.status)}
                      </div>

                      <div className="cc-check-message">
                        {check.message}
                      </div>

                    </div>
                  )
                )}

              </div>
            </div>
          )}

        </section>
      )}
    </div>
  );
}