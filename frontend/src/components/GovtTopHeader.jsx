import { useState, useEffect } from "react";
import { useLanguage, GlobalLanguageSelector } from "../context/LanguageContext";
import "./GovtTopHeader.css";

export default function GovtTopHeader() {
    const { t } = useLanguage();
    const [fontSizeLevel, setFontSizeLevel] = useState("normal");
    const [sessionTime, setSessionTime] = useState(900); // 15 minutes session countdown

    useEffect(() => {
        const timer = setInterval(() => {
            setSessionTime((prev) => (prev > 0 ? prev - 1 : 900));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatSessionTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const handleFontSizeChange = (level) => {
        setFontSizeLevel(level);
        if (level === "large") {
            document.documentElement.style.fontSize = "17px";
        } else if (level === "small") {
            document.documentElement.style.fontSize = "14px";
        } else {
            document.documentElement.style.fontSize = "15px";
        }
    };

    return (
        <div className="govt-header-wrapper">
            {/* TRICOLOR TOP BAR STRIP */}
            <div className="tricolor-bar">
                <div className="saffron-stripe"></div>
                <div className="white-stripe"></div>
                <div className="green-stripe"></div>
            </div>

            {/* TOP UTILITY HEADER BAR */}
            <div className="govt-top-utility-bar">
                <div className="govt-meta-info">
                    <span className="flag-icon"></span>
                    <span className="govt-title-text">
                        {t("govtTitleText")}
                    </span>
                    <span className="cpcl-unit-pill">CPCL Digital Public Infrastructure</span>
                </div>

                <div className="govt-utility-actions">
                    {/* ACCESSIBILITY & FONT RESIZER */}
                    <div className="accessibility-controls">
                        <span className="acc-label">Accessibility:</span>
                        <button
                            className={`acc-btn ${fontSizeLevel === "small" ? "active" : ""}`}
                            onClick={() => handleFontSizeChange("small")}
                            title="Decrease Font Size (A-)"
                        >
                            A-
                        </button>
                        <button
                            className={`acc-btn ${fontSizeLevel === "normal" ? "active" : ""}`}
                            onClick={() => handleFontSizeChange("normal")}
                            title="Reset Font Size (A)"
                        >
                            A
                        </button>
                        <button
                            className={`acc-btn ${fontSizeLevel === "large" ? "active" : ""}`}
                            onClick={() => handleFontSizeChange("large")}
                            title="Increase Font Size (A+)"
                        >
                            A+
                        </button>
                    </div>

                    {/* SESSION COUNTDOWN */}
                    <div className="session-timer-badge">
                        <span className="timer-icon"></span>
                        <span className="timer-text">Session Expiry: <strong>{formatSessionTime(sessionTime)}</strong></span>
                    </div>

                    {/* SECURITY AUDIT STAMP */}
                    <div className="security-stamp">
                        <span className="shield-icon"></span>
                        <span>NIC / STQC Security Audited</span>
                    </div>

                    {/* GLOBAL LANGUAGE SELECTOR */}
                    <GlobalLanguageSelector />
                </div>
            </div>

            {/* OFFICIAL GOVERNMENT ANNOUNCEMENT TICKER */}
            <div className="govt-announcement-ticker">
                <div className="ticker-label">
                    <span className="pulse-dot"></span>
                    <span>OFFICIAL PUBLIC NOTICES:</span>
                </div>
                <div className="ticker-content">
                    <marquee behavior="scroll" direction="left" scrollamount="4">
                         <strong>GFR 2017 Rule 144(xi):</strong> Mandatory land-border compliance declarations active for all GeM Bidders. &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                         <strong>CVC Circular No. 04/2026:</strong> EMD Exemption rules updated for MSME & Make-in-India Class I Suppliers. &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                         <strong>DigiLocker Integration:</strong> Automated UDIN and CA Financial Certificate tamper detection operational.
                    </marquee>
                </div>
            </div>
        </div>
    );
}
