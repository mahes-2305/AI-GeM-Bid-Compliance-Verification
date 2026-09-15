import { useEffect, useState } from "react";
import "./Bids.css";

const DEFAULT_BIDS = [
  {
    id: "BID-001",
    title: "Civil Works",
    description:
      "Construction and renovation of government administrative buildings",
    category: "Construction",
  },
  {
    id: "BID-002",
    title: "IT Hardware",
    description:
      "Supply of computers, networking equipment and IT infrastructure",
    category: "Technology",
  },
  {
    id: "BID-003",
    title: "Medical Equipment",
    description:
      "Supply and installation of medical equipment and devices",
    category: "Healthcare",
  },
  {
    id: "BID-004",
    title: "Electrical Works",
    description:
      "Electrical installation, maintenance and infrastructure works",
    category: "Electrical",
  },
  {
    id: "BID-005",
    title: "Road Construction",
    description:
      "Road construction, repair and infrastructure development",
    category: "Infrastructure",
  },
  {
    id: "BID-006",
    title: "Security Services",
    description:
      "Security personnel and security management services",
    category: "Services",
  },
  {
    id: "BID-007",
    title: "Facility Management",
    description:
      "Building maintenance and facility management services",
    category: "Services",
  },
  {
    id: "BID-008",
    title: "Transportation",
    description:
      "Transportation and logistics services for government operations",
    category: "Logistics",
  },
  {
    id: "BID-009",
    title: "Office Supplies",
    description:
      "Supply of stationery, office equipment and consumables",
    category: "Supplies",
  },
  {
    id: "BID-010",
    title: "Construction Materials",
    description:
      "Supply of construction materials and related products",
    category: "Supplies",
  },
];

const STORAGE_KEY = "nexverify_bids";

export default function Bids() {
  const [bids, setBids] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setBids(JSON.parse(saved));
      } catch {
        setBids(DEFAULT_BIDS);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(DEFAULT_BIDS)
        );
      }
    } else {
      setBids(DEFAULT_BIDS);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(DEFAULT_BIDS)
      );
    }
  }, []);

  const saveBids = (updatedBids) => {
    setBids(updatedBids);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedBids)
    );
  };

  const handleRequirementUpload = async (bidId, file) => {
    if (!file) return;

    try {
      setMessage("Uploading requirement document...");

      const formData = new FormData();
      formData.append("document", file);

      const response = await fetch(
        "http://localhost:5000/api/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to upload requirement document"
        );
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
                backendFileName:
                  data.file?.fileName || "",
              },
            }
          : bid
      );

      saveBids(updated);

      setMessage(
        `Requirement document saved successfully for ${bidId}.`
      );

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Requirement upload error:",
        error
      );

      setMessage(
        `Upload failed: ${error.message}`
      );

      setTimeout(() => {
        setMessage("");
      }, 4000);
    }
  };

  return (
    <div className="bids-page">
      <div className="bids-header">
        <div>
          <h1>Bids</h1>
          <p>
            Manage procurement opportunities and requirement
            documents
          </p>
        </div>
      </div>

      {message && (
        <div className="bids-message">
          {message}
        </div>
      )}

      <div className="bids-summary">
        <div>
          <span>Total Bids</span>
          <strong>{bids.length}</strong>
        </div>

        <div>
          <span>Requirements Uploaded</span>
          <strong>
            {
              bids.filter(
                (bid) => bid.requirementDocument
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Active Opportunities</span>
          <strong>{bids.length}</strong>
        </div>
      </div>

      <div className="bids-grid">
        {bids.map((bid) => (
          <div
            className="bid-card"
            key={bid.id}
          >
            <div className="bid-card-top">
              <span className="bid-id">
                {bid.id}
              </span>

              <span className="bid-category">
                {bid.category}
              </span>
            </div>

            <h2>{bid.title}</h2>

            <p>{bid.description}</p>

            <div className="bid-requirement">
              <div>
                <strong>
                  Requirement Document
                </strong>

                {bid.requirementDocument ? (
                  <span className="uploaded">
                    ✓{" "}
                    {bid.requirementDocument.name}
                  </span>
                ) : (
                  <span className="not-uploaded">
                    No document uploaded
                  </span>
                )}
              </div>

              <label className="upload-btn">
                {bid.requirementDocument
                  ? "Replace"
                  : "Upload"}

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(event) =>
                    handleRequirementUpload(
                      bid.id,
                      event.target.files[0]
                    )
                  }
                />
              </label>
            </div>

            <div className="bid-card-footer">
              <span className="active-status">
                ● Active
              </span>

              <span>
                Open for submissions
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}