import { useState } from "react";
import "./SSOPage.css";

function ShieldIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32 5L51 13V28C51 41 43.2 52.3 32 57C20.8 52.3 13 41 13 28V13L32 5Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M23 31L29 37L42 23"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M4 21V7L13 4V21"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13 10H20V21H13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 9H10M7 13H10M7 17H10M16 13H18M16 17H18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M4 7L12 13L20 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="3.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M5 20C5.7 15.9 8 14 12 14C16 14 18.3 15.9 19 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M20 11C19.5 7 16.1 4 12 4C8.4 4 5.4 6.3 4.3 9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 5V10H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13C4.5 17 7.9 20 12 20C15.6 20 18.6 17.7 19.7 14.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 19V14H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SSOPage({ onBack, onLogin }) {
  const [form, setForm] = useState({
    organization: "Chennai Petroleum Corporation Limited (CPCL / MoPNG)",
    email: "priya.menon@cpcl.gov.in",
    employeeId: "EMP-90214",
    otp: "",
    captcha: "",
  });

  const generateSSOCaptcha = () => {
    const characters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let value = "";
    for (let i = 0; i < 5; i++) {
      value += characters[Math.floor(Math.random() * characters.length)];
    }
    return value;
  };

  const [captcha, setCaptcha] = useState(generateSSOCaptcha);
  const [otpNotice, setOtpNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const refreshCaptcha = () => {
    setCaptcha(generateSSOCaptcha());
    updateField("captcha", "");
  };

  const handleSendSSOOtp = async () => {
    if (!form.email.trim()) {
      alert("Please enter your official government email ID first.");
      return;
    }
    setLoading(true);
    setOtpNotice("");
    setErrorMsg("");

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: form.email.trim(), channel: "email" }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setOtpNotice(` SSO OTP sent to your registered email address.`);
      } else {
        setErrorMsg(data.message || "Failed to send SSO OTP");
      }
    } catch (err) {
      setErrorMsg("Network error connecting to SSO authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSSO = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    if (!form.organization.trim()) {
      alert("Please enter your organization.");
      return;
    }
    if (!form.email.trim()) {
      alert("Please enter your official government email ID.");
      return;
    }
    if (!form.employeeId.trim()) {
      alert("Please enter your employee / officer ID.");
      return;
    }
    if (!form.captcha.trim()) {
      alert("Please enter the CAPTCHA code.");
      return;
    }
    if (form.captcha !== captcha) {
      alert("Invalid CAPTCHA code. Please match exactly (case-sensitive).");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/sso-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization: form.organization.trim(),
          email: form.email.trim(),
          employeeId: form.employeeId.trim(),
          otp: form.otp.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setErrorMsg(data.message || "SSO Authentication failed");
        refreshCaptcha();
        return;
      }

      if (typeof onLogin === "function") {
        onLogin({
          token: data.token,
          user: data.user,
          organization: data.user.organization,
          email: data.user.email,
          employeeId: data.user.employeeId,
        });
      }
    } catch (err) {
      setErrorMsg("SSO server authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-overlay"></div>

      {/* TOPBAR WITH BACK BUTTON */}
      <div style={{ position: "absolute", top: "20px", left: "24px", zIndex: 100 }}>
        <button
          onClick={onBack}
          style={{
            background: "var(--bg-surface)",
            color: "var(--text-muted)",
            border: "1px solid rgba(0, 0, 0, 0.15)",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => { e.currentTarget.style.color = "var(--text-main)"; e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.3)"; }}
          onMouseOut={(e) => { e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.15)"; }}
        >
          <span>←</span> Back to Login
        </button>
      </div>

      <div className="login-content" style={{ marginTop: "40px" }}>
        {/* LEFT BRANDING - Exact Match with Login Page */}
        <div className="branding-section">
          <img
            src="/nexverify-logo.png"
            alt="NexVerify AI"
            className="nexverify-logo"
          />
          <div className="verification-title">Government Procurement AI Platform</div>
          <div className="title-line"></div>
          <div className="security-icon">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M32 5L52 13V28C52 42 43 53 32 59C21 53 12 42 12 28V13L32 5Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M22 32L29 39L43 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="brand-heading">Ministry of Petroleum & Natural Gas | Government of India</h2>
          <p className="brand-description">Chennai Petroleum Corporation Limited (CPCL)</p>
        </div>

        {/* LOGIN CARD */}
        <div className="login-card">
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>
               Organization SSO Verified
            </span>
          </div>

          {errorMsg && (
            <div style={{ padding: "10px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "8px", fontSize: "13px", marginBottom: "15px" }}>
               {errorMsg}
            </div>
          )}

          <form className="login-form" onSubmit={handleSSO} noValidate>

            {/* ORGANIZATION */}
            <div className="form-group">
              <label>Organization / Ministry</label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <BuildingIcon />
                </span>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => updateField("organization", e.target.value)}
                  placeholder="Enter your organization"
                  style={{
                    width: "100%", background: "transparent", border: "none", color: "var(--text-main)", outline: "none", padding: "8px 0"
                  }}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label>Official Government Email ID</label>
              <div className="input-wrapper">
                <span className="input-icon"><MailIcon /></span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="priya.menon@cpcl.gov.in"
                  style={{
                    width: "100%", background: "transparent", border: "none", color: "var(--text-main)", outline: "none", padding: "8px 0"
                  }}
                />
              </div>
            </div>

            {/* EMPLOYEE ID */}
            <div className="form-group">
              <label>Employee / Officer ID</label>
              <div className="input-wrapper">
                <span className="input-icon"><UserIcon /></span>
                <input
                  type="text"
                  value={form.employeeId}
                  onChange={(e) => updateField("employeeId", e.target.value)}
                  placeholder="EMP-90214"
                  style={{
                    width: "100%", background: "transparent", border: "none", color: "var(--text-main)", outline: "none", padding: "8px 0"
                  }}
                />
              </div>
            </div>

            {/* OTP VERIFICATION */}
            <div className="form-group">
              <label>SSO Security OTP Code (Optional)</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <div className="input-wrapper" style={{ flex: 1 }}>
                  <span className="input-icon"></span>
                  <input
                    type="text"
                    value={form.otp}
                    onChange={(e) => updateField("otp", e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    style={{
                      width: "100%", background: "transparent", border: "none", color: "var(--text-main)", outline: "none", padding: "8px 0"
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendSSOOtp}
                  disabled={loading}
                  style={{
                    padding: "0 14px",
                    background: "rgba(37, 99, 235, 0.2)",
                    border: "1px solid #2563eb",
                    color: "#60a5fa",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                  }}
                >
                  {loading ? "..." : "Send OTP"}
                </button>
              </div>
              {otpNotice && <div style={{ fontSize: "12px", color: "#34d399", marginTop: "4px" }}>{otpNotice}</div>}
            </div>

            {/* CAPTCHA */}
            <div className="captcha-group">
              <label>Security CAPTCHA</label>
              <div className="captcha-top-row">
                <div className="captcha-display">{captcha}</div>
                <button type="button" className="captcha-refresh" onClick={refreshCaptcha}>
                  ↻ Refresh CAPTCHA
                </button>
              </div>
              <div className="input-wrapper captcha-input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="text"
                  value={form.captcha}
                  onChange={(e) => updateField("captcha", e.target.value)}
                  placeholder="Enter 5-character CAPTCHA"
                  maxLength={5}
                  style={{
                    width: "100%", background: "transparent", border: "none", color: "var(--text-main)", outline: "none", padding: "8px 0"
                  }}
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button type="submit" className="sign-in-button" disabled={loading} style={{ marginTop: "16px" }}>
              {loading ? "Verifying SSO Identity..." : "Continue with Organization SSO"}
            </button>

            <p style={{ textAlign: "center", fontSize: "11px", color: "var(--text-muted)", marginTop: "16px" }}>
              Your CPCL / Government identity provider will verify credentials before granting access.
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}

export default SSOPage;