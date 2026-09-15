import { useState } from "react";
import "./ComplianceChecks.css";

export default function ComplianceChecks() {
  const [tenderFile, setTenderFile] = useState(null);
  const [bidderFile, setBidderFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= VERIFY DOCUMENTS =================

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

      // Debug information
      console.log("FULL VERIFICATION RESPONSE:", data);
      console.log("COMPLIANCE RESULT:", data.complianceResult);
      console.log(
        "COMPLIANCE DETAILS:",
        data.complianceResult?.details
      );

      setResult(data);
    } catch (err) {
      console.error("Verification error:", err);
      setError(
        err.message || "Unable to connect to the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= COMPLIANCE HELPERS =================

  const getChecks = () => {
  const compliance = result?.complianceResult;

  if (!compliance) {
    return [];
  }

  // Format 1: details is an object
  if (
    compliance.details &&
    typeof compliance.details === "object" &&
    !Array.isArray(compliance.details)
  ) {
    return Object.entries(compliance.details).map(
      ([key, value]) => ({
        key,
        ...value,
      })
    );
  }

  // Format 2: details is an array
  if (Array.isArray(compliance.details)) {
    return compliance.details.map((check, index) => ({
      key: check.key || check.name || `Check ${index + 1}`,
      ...check,
    }));
  }

  // Format 3: backend calls it checks
  if (Array.isArray(compliance.checks)) {
    return compliance.checks.map((check, index) => ({
      key: check.key || check.name || `Check ${index + 1}`,
      ...check,
    }));
  }

  return [];
};

const getNormalizedStatus = (status) => {
  const value = String(status || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (value === "PASS" || value === "PASSED") {
    return "PASS";
  }

  if (value === "FAIL" || value === "FAILED") {
    return "FAIL";
  }

  return "REVIEW";
};

const countStatus = (type) => {
  return getChecks().filter(
    (check) =>
      getNormalizedStatus(check.status) === type
  ).length;
};

  const getStatusClass = (status) => {
    const normalizedStatus = getNormalizedStatus(status);

    if (normalizedStatus === "PASS") {
      return "cc-pass";
    }

    if (normalizedStatus === "FAIL") {
      return "cc-fail";
    }

    return "cc-review";
  };

  const formatStatus = (status) => {
    const normalizedStatus = getNormalizedStatus(status);

    if (normalizedStatus === "PASS") {
      return "Passed";
    }

    if (normalizedStatus === "FAIL") {
      return "Failed";
    }

    return "Review Required";
  };

  const formatCheckName = (key) => {
    return String(key)
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ================= CURRENCY =================

  const formatCurrency = (value) => {
    if (value === null || value === undefined) {
      return "Not available";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // ================= OVERALL STATUS =================

  const formatOverallStatus = (status) => {
    if (!status) {
      return "UNKNOWN";
    }

    return String(status)
      .replace(/_/g, " ")
      .toUpperCase();
  };

  const getOverallClass = (status) => {
    if (status === "COMPLIANT") {
      return "cc-overall-pass";
    }

    if (status === "NON-COMPLIANT") {
      return "cc-overall-fail";
    }

    return "cc-overall-review";
  };

  // ================= UI =================

  return (
    <div className="cc-page">

      {/* ================= HEADER ================= */}

      <div className="cc-header">
        <div>
          <h1>Compliance Verification</h1>

          <p>
            Upload the tender and bidder documents to
            automatically verify compliance.
          </p>
        </div>
      </div>

      {/* ================= DOCUMENT UPLOAD ================= */}

      <section className="cc-upload-grid">

        {/* TENDER */}

        <div className="cc-upload-card">

          <div className="cc-upload-icon">
            📄
          </div>

          <h2>Tender Document</h2>

          <p>
            Upload the tender / GeM bid document
            containing the requirements.
          </p>

          <label className="cc-file-label">

            {tenderFile
              ? "Change Tender Document"
              : "Choose Tender Document"}

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                setTenderFile(
                  e.target.files[0] || null
                );

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

        {/* BIDDER */}

        <div className="cc-upload-card">

          <div className="cc-upload-icon">
            📋
          </div>

          <h2>Bidder Document</h2>

          <p>
            Upload the bidder's submitted documents
            for verification.
          </p>

          <label className="cc-file-label">

            {bidderFile
              ? "Change Bidder Document"
              : "Choose Bidder Document"}

            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                setBidderFile(
                  e.target.files[0] || null
                );

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
          {loading
            ? "Verifying Documents..."
            : "Verify Documents"}
        </button>

      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="cc-error">
          ⚠ {error}
        </div>
      )}

      {/* ================= RESULT ================= */}

      {result?.complianceResult && (
        <section className="cc-result">

          {/* ================= OVERALL RESULT ================= */}

          <div className="cc-result-header">

            <div>
              <h2>Verification Result</h2>

              <p>
                {result.tenderDocument?.originalName ||
                  "Tender document"}{" "}
                vs{" "}
                {result.bidderDocument?.originalName ||
                  "Bidder document"}
              </p>
            </div>

            <div
              className={`cc-overall ${getOverallClass(
                result.complianceResult.overallStatus
              )}`}
            >
              {formatOverallStatus(
                result.complianceResult.overallStatus
              )}
            </div>

          </div>

          {/* ================= SUMMARY ================= */}

          <div className="cc-summary">

            {/* PASSED */}

            <div className="cc-summary-card">

              <span>Passed</span>

              <strong>
                {countStatus("PASS")}
              </strong>

            </div>

            {/* FAILED */}

            <div className="cc-summary-card">

              <span>Failed</span>

              <strong>
                {countStatus("FAIL")}
              </strong>

            </div>

            {/* REVIEW */}

            <div className="cc-summary-card">

              <span>Review Required</span>

              <strong>
                {countStatus("REVIEW")}
              </strong>

            </div>

          </div>

          {/* ================= BIDDER INFORMATION ================= */}

          {result.extractedData && (
            <div className="cc-panel">

              <div className="cc-panel-title">
                <h2>
                  Extracted Bidder Information
                </h2>
              </div>

              <div className="cc-info-grid">

                {/* PAN */}

                <div>
                  <span>PAN</span>

                  <strong>
                    {result.extractedData.pan ||
                      "Not found"}
                  </strong>
                </div>

                {/* GST */}

                <div>
                  <span>GSTIN</span>

                  <strong>
                    {result.extractedData.gst ||
                      "Not found"}
                  </strong>
                </div>

                {/* LEGAL ENTITY */}

                <div>
                  <span>Legal Entity</span>

                  <strong>
                    {result.extractedData
                      .legalEntity ||
                      "Not found"}
                  </strong>
                </div>

                {/* TURNOVER */}

                <div>
                  <span>Annual Turnover</span>

                  <strong>
                    {formatCurrency(
                      result.extractedData
                        .annualTurnover
                    )}
                  </strong>
                </div>

                {/* EXPERIENCE */}

                <div>
                  <span>Experience</span>

                  <strong>
                    {result.extractedData
                      .experienceYears ??
                      "Not found"}{" "}
                    years
                  </strong>
                </div>

                {/* WORK ORDERS */}

                <div>
                  <span>Similar Work Orders</span>

                  <strong>
                    {result.extractedData
                      .similarWorkOrders ??
                      "Not found"}
                  </strong>
                </div>

                {/* LARGEST ORDER */}

                <div>
                  <span>Largest Order Value</span>

                  <strong>
                    {formatCurrency(
                      result.extractedData
                        .largestOrderValue
                    )}
                  </strong>
                </div>

                {/* DEBARRED */}

                <div>
                  <span>Debarred</span>

                  <strong>
                    {result.extractedData
                      .debarred === null
                      ? "Not available"
                      : result.extractedData
                          .debarred
                      ? "Yes"
                      : "No"}
                  </strong>
                </div>

              </div>

            </div>
          )}

          {/* ================= COMPLIANCE CHECKS ================= */}

          {getChecks().length > 0 && (
            <div className="cc-panel">

              <div className="cc-panel-title">

                <h2>
                  Compliance Checks
                </h2>

              </div>

              <div className="cc-check-list">

                {getChecks().map((check) => (
  <div
    className="cc-check-row"
    key={check.key}
  >
    <div className="cc-check-name">
      {formatCheckName(check.key)}
    </div>

    <div
      className={`cc-status ${getStatusClass(
        check.status
      )}`}
    >
      {formatStatus(check.status)}
    </div>

    <div className="cc-check-message">
      {check.message ||
        "No additional information available."}
    </div>
  </div>
))}

              </div>

            </div>
          )}

        </section>
      )}

    </div>
  );
}