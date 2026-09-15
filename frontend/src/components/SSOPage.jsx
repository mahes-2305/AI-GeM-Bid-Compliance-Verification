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
    organization: "",
    email: "",
    employeeId: "",
    captcha: "",
  });

  const [captcha, setCaptcha] = useState("7F3K9");

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const refreshCaptcha = () => {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let value = "";

    for (let i = 0; i < 5; i++) {
      value += characters[Math.floor(Math.random() * characters.length)];
    }

    setCaptcha(value);
    updateField("captcha", "");
  };

  const handleSSO = (event) => {
  event.preventDefault();

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

  if (form.captcha.toUpperCase() !== captcha.toUpperCase()) {
    alert("Invalid CAPTCHA code.");
    return;
  }

  if (typeof onLogin === "function") {
    onLogin({
      organization: form.organization.trim(),
      email: form.email.trim(),
      employeeId: form.employeeId.trim(),
    });
  }
};
  return (
    <div className="sso-page">
      <div className="sso-background-overlay"></div>

      {/* Decorative elements */}
      <div className="sso-orb sso-orb-one"></div>
      <div className="sso-orb sso-orb-two"></div>
      <div className="sso-orb sso-orb-three"></div>

      {/* TOP */}
      <div className="sso-topbar">
        <button className="sso-back-button" onClick={onBack}>
          <span>←</span>
          Back to Login
        </button>

        <img
          src="/src/assets/nexverify-logo.png"
          alt="NexVerify AI"
          className="sso-small-logo"
        />
      </div>

      {/* MAIN CONTENT */}
      <div className="sso-content">
        <div className="sso-card">
          {/* ICON */}
          <div className="sso-main-icon">
            <ShieldIcon />
          </div>

          {/* HEADER */}
          <h1>Sign in with SSO</h1>

          <p className="sso-description">
            Use your organization's verified identity to securely access
            NexVerify AI.
          </p>

          {/* SECURITY BANNER */}
          <div className="sso-security-banner">
            <div className="sso-lock-icon">
              <ShieldIcon />
            </div>

            <span>Secure organization authentication</span>
          </div>

          <form onSubmit={handleSSO}>
            {/* ORGANIZATION */}
            <div className="sso-field">
              <label>Department / Ministry / Organization</label>

              <div className="sso-input">
                <span className="sso-field-icon">
                  <BuildingIcon />
                </span>

                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) =>
                    updateField("organization", e.target.value)
                  }
                  placeholder="Enter your organization"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="sso-field">
              <label>Official government email ID</label>

              <div className="sso-input">
                <span className="sso-field-icon">
                  <MailIcon />
                </span>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    updateField("email", e.target.value)
                  }
                  placeholder="name@department.gov.in"
                />
              </div>
            </div>

            {/* EMPLOYEE */}
            <div className="sso-field">
              <label>Employee / Officer ID</label>

              <div className="sso-input">
                <span className="sso-field-icon">
                  <UserIcon />
                </span>

                <input
                  type="text"
                  value={form.employeeId}
                  onChange={(e) =>
                    updateField("employeeId", e.target.value)
                  }
                  placeholder="Enter employee / officer ID"
                />
              </div>
            </div>

            {/* CAPTCHA */}
            <div className="sso-captcha">
              <label>Enter CAPTCHA Code</label>

              <div className="sso-captcha-row">
                <div className="sso-captcha-image">
                  <span>{captcha}</span>
                </div>

                <button
                  type="button"
                  className="sso-refresh"
                  onClick={refreshCaptcha}
                >
                  <RefreshIcon />
                  Refresh
                </button>

                <div className="sso-input sso-captcha-input">
                  <span className="sso-field-icon">
                    <ShieldIcon />
                  </span>

                  <input
                    type="text"
                    value={form.captcha}
                    onChange={(e) =>
                      updateField("captcha", e.target.value)
                    }
                    placeholder="Enter CAPTCHA code"
                  />
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <button type="submit" className="sso-submit-button">
              Continue with Organization SSO
            </button>
          </form>

          {/* FOOTER */}
          <p className="sso-footer-note">
            Your organization's identity provider will authenticate your
            account before access is granted.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SSOPage;