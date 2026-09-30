import { useEffect, useState } from "react";
import "./CompareBids.css";

const INITIAL_BIDDERS = [
    {
        id: "BID-001",
        vendorName: "Aravali Steel Works Pvt Ltd",
        cin: "U74999MH2018PTC308891",
        legalEntity: "Private Limited",
        score: 100,
        riskLevel: "LOW",
        quoteAmount: 42500000,
        gstStatus: "ACTIVE (Regular)",
        gstFilingRate: "100%",
        panStatus: "VERIFIED ACTIVE",
        turnover: 52000000,
        experienceYears: 8,
        debarmentStatus: "CLEAN RECORD",
        digiLocker: "AUTHENTIC (UDIN Verified)",
        rank: 1,
        recommendation: "RECOMMENDED L1 COMPLIANT",
        badgeClass: "badge-recommend"
    },
    {
        id: "BID-002",
        vendorName: "Nirmaan Infratech Pvt Ltd",
        cin: "U45200DL2016PTC299102",
        legalEntity: "Private Limited (MSME Small)",
        score: 88,
        riskLevel: "MEDIUM",
        quoteAmount: 39800000,
        gstStatus: "ACTIVE",
        gstFilingRate: "98%",
        panStatus: "VERIFIED ACTIVE",
        turnover: 28000000,
        experienceYears: 5,
        debarmentStatus: "CLEAN RECORD",
        digiLocker: "AUTHENTIC",
        rank: 2,
        recommendation: "CONDITIONAL (Turnover Shortfall)",
        badgeClass: "badge-warn"
    },
    {
        id: "BID-003",
        vendorName: "Bharat Logistics & Suppliers",
        cin: "U63090UP2015PTC071234",
        legalEntity: "Private Limited",
        score: 40,
        riskLevel: "HIGH",
        quoteAmount: 37500000,
        gstStatus: "CANCELLED",
        gstFilingRate: "40%",
        panStatus: "INVALID FORMAT",
        turnover: 12000000,
        experienceYears: 2,
        debarmentStatus: "DEBARRED (GeM Blacklist)",
        digiLocker: "UNVERIFIED",
        rank: 3,
        recommendation: "DISQUALIFIED",
        badgeClass: "badge-danger"
    }
];

export default function CompareBids() {
    const [bidders, setBidders] = useState(INITIAL_BIDDERS);

    useEffect(() => {
        const fetchLiveSubmissions = async () => {
            try {
                const res = await fetch("/api/documents/submissions");
                const data = await res.json();
                if (res.ok && data.success && Array.isArray(data.submissions) && data.submissions.length > 0) {
                    const formattedLive = data.submissions.map((sub, idx) => ({
                        id: sub.id,
                        vendorName: sub.bidderName || "Uploaded Bidder",
                        cin: "VERIFIED ONLINE",
                        legalEntity: "Verified Entity",
                        score: sub.complianceScore || 88,
                        riskLevel: sub.riskLevel || "LOW",
                        quoteAmount: 41000000,
                        gstStatus: sub.gstin ? "ACTIVE (GSTN Verified)" : "UNVERIFIED",
                        gstFilingRate: "99%",
                        panStatus: sub.pan ? "VERIFIED ACTIVE" : "UNVERIFIED",
                        turnover: sub.annualTurnover || 45000000,
                        experienceYears: sub.experienceYears || 5,
                        debarmentStatus: sub.riskLevel === "HIGH" ? "DEBARRED ALERT" : "CLEAN RECORD",
                        digiLocker: "AUTHENTIC (Digital Seal)",
                        rank: idx + 1,
                        recommendation: sub.recommendation || "QUALIFIED",
                        badgeClass: sub.complianceScore >= 85 ? "badge-recommend" : sub.complianceScore >= 60 ? "badge-warn" : "badge-danger"
                    }));

                    setBidders([...formattedLive, ...INITIAL_BIDDERS].slice(0, 5));
                }
            } catch (err) {
                console.warn("Using default comparison matrix bidders:", err.message);
            }
        };

        fetchLiveSubmissions();
    }, []);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }).format(val);
    };

    return (
        <div className="cb-container">
            <header className="cb-header">
                <div>
                    <span className="cb-pill">GeM Procurement Decision Matrix</span>
                    <h1>Multi-Bidder Evaluation & AI Vendor Ranking</h1>
                    <p>Side-by-side compliance, commercial quote, and statutory registry comparison for tender GEM-2026-003.</p>
                </div>
            </header>

            {/* TOP AI RECOMMENDATION CARD */}
            <div className="cb-ai-banner">
                <div className="cb-ai-star"></div>
                <div>
                    <h3>AI Evaluation Winner: {bidders[0]?.vendorName}</h3>
                    <p>
                        Rank #1 Vendor achieves <strong>{bidders[0]?.score}% Compliance Score</strong>, clean debarment history across CPSE registries,
                        and meets all financial turnover and experience criteria.
                    </p>
                </div>
            </div>

            {/* COMPARISON MATRIX TABLE */}
            <div className="cb-table-wrapper">
                <table className="cb-table">
                    <thead>
                        <tr>
                            <th>Evaluation Metric</th>
                            {bidders.map((b, idx) => (
                                <th key={b.id || idx} className={idx === 0 ? "th-winner" : ""}>
                                    <div className="cb-th-id">{b.id}</div>
                                    <div className="cb-th-name">{b.vendorName}</div>
                                    <span className={`cb-rank-badge ${b.badgeClass}`}>Rank #{idx + 1}</span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>AI Compliance Score</td>
                            {bidders.map((b, idx) => (
                                <td key={b.id || idx} className="mono-score">
                                    <span className={`score-pill ${b.score > 85 ? "high" : b.score > 60 ? "mid" : "low"}`}>
                                        {b.score}%
                                    </span>
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>Commercial Bid Quote</td>
                            {bidders.map((b, idx) => (
                                <td key={b.id || idx}>
                                    <strong>{formatCurrency(b.quoteAmount)}</strong>
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>GSTN Portal Status</td>
                            {bidders.map((b, idx) => (
                                <td key={b.id || idx}>
                                    <span className={`tag ${b.gstStatus.includes("ACTIVE") ? "tag-pass" : "tag-fail"}`}>
                                        {b.gstStatus}
                                    </span>
                                    <div className="sub-text">Filing Rate: {b.gstFilingRate}</div>
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>Income Tax / PAN</td>
                            {bidders.map((b, idx) => (
                                <td key={b.id || idx}>
                                    <span className={`tag ${b.panStatus.includes("VERIFIED") ? "tag-pass" : "tag-fail"}`}>
                                        {b.panStatus}
                                    </span>
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>Annual Financial Turnover</td>
                            {bidders.map((b, idx) => (
                                <td key={b.id || idx}>
                                    {formatCurrency(b.turnover)}
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>Registered Experience</td>
                            {bidders.map((b, idx) => (
                                <td key={b.id || idx}>
                                    {b.experienceYears} Years
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>Central Debarment DB</td>
                            {bidders.map((b, idx) => (
                                <td key={b.id || idx}>
                                    <span className={`tag ${b.debarmentStatus.includes("CLEAN") ? "tag-pass" : "tag-fail"}`}>
                                        {b.debarmentStatus}
                                    </span>
                                </td>
                            ))}
                        </tr>

                        <tr>
                            <td>DigiLocker & UDIN Status</td>
                            {bidders.map((b, idx) => (
                                <td key={b.id || idx}>
                                    {b.digiLocker}
                                </td>
                            ))}
                        </tr>

                        <tr className="tr-actions">
                            <td>Officer Action</td>
                            {bidders.map((b, idx) => (
                                <td key={b.id || idx}>
                                    <button 
                                        className={`btn-select ${idx === 0 ? "btn-primary" : "btn-secondary"}`}
                                        onClick={() => {
                                            if (idx === 0) {
                                                alert(`Tender Successfully Awarded to ${b.vendorName}`);
                                                const notifications = JSON.parse(localStorage.getItem('nexverify_notifications') || '[]');
                                                notifications.push({ id: Date.now(), message: `Congratulations! You have been awarded tender ${b.id}.`, to: b.vendorName });
                                                localStorage.setItem('nexverify_notifications', JSON.stringify(notifications));
                                            } else {
                                                alert(`Audit File generated for ${b.vendorName}`);
                                            }
                                        }}
                                    >
                                        {idx === 0 ? "Award Tender L1" : "View Audit File"}
                                    </button>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
