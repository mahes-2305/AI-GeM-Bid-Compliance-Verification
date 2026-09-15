import { useEffect, useState } from "react";
import "./BidderDashboard.css";

const STORAGE_KEY = "nexverify_bids";

function BidderDashboard({ userName = "Bidder User", onLogout }) {
  const [bids, setBids] = useState([]);
  const [selectedBid, setSelectedBid] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
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
  }, []);

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
      "http://localhost:5000/api/documents/verify",
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
    // Save verification result for the procurement officer
const submissions = JSON.parse(
  localStorage.getItem("nexverify_submissions") || "[]"
);

submissions.push({
  id: `SUB-${Date.now()}`,
  bidId: selectedBid.id,
  bidTitle: selectedBid.title,
  bidderName: userName,
  submittedAt: new Date().toISOString(),

  bidderDocument: documents[0].name,

  tenderDocument:
    selectedBid.requirementDocument?.name || "Requirement Document",

  overallStatus:
    data.complianceResult?.overallStatus ||
    data.complianceResult?.status ||
    "REVIEW_REQUIRED",

  complianceResult: data.complianceResult,

  extractedData: data.extractedData,

  requirements: data.requirements,
});

localStorage.setItem(
  "nexverify_submissions",
  JSON.stringify(submissions)
);
    setVerificationMessage(
      "Verification completed successfully."
    );
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
          <div className="bidder-logo-mark">N</div>

          <span>
            NexVerify<em>AI</em>
          </span>
        </div>

        <nav>
          <button className="bidder-nav-active">
            Available Bids
          </button>

          <button>
            My Submissions
          </button>

          <button>
            Documents
          </button>

          <button>
            Status
          </button>
        </nav>

        <div className="bidder-profile">
          <div className="bidder-avatar">
            BU
          </div>

          <div>
            <strong>{userName}</strong>
            <span>Bidder</span>
          </div>

          <button
            className="bidder-logout"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="bidder-main">

        {/* HEADER */}
        <header className="bidder-header">
          <div>
            <h1>Available Bids</h1>

            <p>
              Select a procurement opportunity and submit
              your documents.
            </p>
          </div>

          <button
            className="bidder-header-logout"
            onClick={onLogout}
          >
            Logout
          </button>
        </header>

        {/* STATISTICS */}
        <section className="bidder-stats">
          <div>
            <span>Active Bids</span>
            <strong>{bids.length}</strong>
          </div>

          <div>
            <span>My Submissions</span>
            <strong>
              {verificationResult ? 1 : 0}
            </strong>
          </div>

          <div>
            <span>Documents Uploaded</span>
            <strong>{documents.length}</strong>
          </div>
        </section>

        {/* BIDS */}
        <section className="bidder-bids">
          {bids.map((bid) => (
            <div
              className={`bidder-card ${
                selectedBid?.id === bid.id
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
                  ? "Selected"
                  : "Select Bid"}
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
      </main>
    </div>
  );
}

export default BidderDashboard;