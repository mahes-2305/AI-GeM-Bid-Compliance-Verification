import { useState } from "react";
import "./RegisterPage.css";

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

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20C5.7 15.9 8 14 12 14C16 14 18.3 15.9 19 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M7 3.5L10 3L12 8L9.8 9.5C10.8 11.8 12.2 13.2 14.5 14.2L16 12L21 14L20.5 17C20.2 19 18.8 20 17.3 20C9.9 19.5 4.5 14.1 4 6.7C4 5.2 5 3.8 7 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M4 21V7L13 4V21" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M13 10H20V21H13" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 9H10M7 13H10M7 17H10M16 13H18M16 17H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 7V5C8 3.9 8.9 3 10 3H14C15.1 3 16 3.9 16 5V7" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 12H21M10 12V14H14V12" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path d="M20 11C19.5 7 16.1 4 12 4C8.4 4 5.4 6.3 4.3 9.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 5V10H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13C4.5 17 7.9 20 12 20C15.6 20 18.6 17.7 19.7 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 19V14H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RegisterPage({ onBack }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    employeeId: "",
    mobile: "",
    fullName: "",
    organization: "",
    designation: "",
    procurementRole: "procurement-officer",
    captcha: "",
  });

  const [authorized, setAuthorized] = useState(false);
  const [captcha, setCaptcha] = useState("7F3K9");
  const [submitted, setSubmitted] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  const handleSubmitStep1 = async (event) => {
    event.preventDefault();
    setErrorMsg("");

    if (!authorized) {
      alert("Please confirm authorization to access procurement information.");
      return;
    }
    if (!form.email.trim() || !form.fullName.trim() || !form.organization.trim()) {
      alert("Please fill in email, full name, and organization.");
      return;
    }
    if (!form.captcha.trim()) {
      alert("Please enter CAPTCHA code.");
      return;
    }
    if (form.captcha.toUpperCase() !== captcha.toUpperCase()) {
      alert("Invalid CAPTCHA code.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setErrorMsg(data.message || "Registration failed");
        return;
      }

      setGeneratedOtp(data.otp);
      setStep(2);
    } catch (err) {
      setErrorMsg("Network error initiating registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.email.trim(),
          otp: otpInput.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setErrorMsg(data.message || "Invalid OTP code");
        return;
      }

      setStep(3);
      setSubmitted(true);
    } catch (err) {
      setErrorMsg("Error verifying OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-background-overlay"></div>
      <div className="register-orb register-orb-one"></div>
      <div className="register-orb register-orb-two"></div>
      <div className="register-orb register-orb-three"></div>

      {/* TOPBAR */}
      <div className="register-topbar">
        <button className="register-back-button" onClick={onBack}>
          <span className="back-arrow">←</span> Back to Login
        </button>
        <img
          src="/src/assets/nexverify-logo.png"
          alt="NexVerify AI"
          className="register-small-logo"
        />
      </div>

      {/* HEADER */}
      <div className="register-header">
        <div className="register-shield"><ShieldIcon /></div>
        <h1>Create Account</h1>
        <p>Register as an authorized government / organization procurement officer.</p>
      </div>

      {/* PROGRESS BAR */}
      <div className="registration-progress">
        <div className={`progress-item ${step >= 1 ? "active" : ""}`}>
          <div className="progress-number">1</div>
          <div className="progress-text"><strong>Basic Registration</strong><span>Officer details</span></div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-item ${step >= 2 ? "active" : ""}`}>
          <div className="progress-number">2</div>
          <div className="progress-text"><strong>OTP Verification</strong><span>Email + Mobile</span></div>
        </div>
        <div className="progress-line"></div>
        <div className={`progress-item ${step >= 3 ? "active" : ""}`}>
          <div className="progress-number">3</div>
          <div className="progress-text"><strong>Organization Verification</strong><span>Admin approval</span></div>
        </div>
      </div>

      {errorMsg && (
        <div style={{ maxWidth: "680px", margin: "0 auto 15px auto", padding: "12px", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", color: "#f87171", borderRadius: "8px" }}>
           {errorMsg}
        </div>
      )}

      {/* STEP 1: REGISTRATION FORM */}
      {step === 1 && (
        <form className="register-card" onSubmit={handleSubmitStep1}>
          <div className="register-section-heading">
            <h2>Basic Registration</h2>
            <p>Enter your official organization details.</p>
          </div>

          <div className="register-grid">
            <div className="register-field">
              <label>Official government email ID</label>
              <div className="register-input">
                <span className="field-icon"><MailIcon /></span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="name@department.gov.in"
                />
              </div>
            </div>

            <div className="register-field">
              <label>Account Password</label>
              <div className="register-input">
                <span className="field-icon"></span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Set a secure password"
                />
              </div>
            </div>

            <div className="register-field">
              <label>Employee / Officer ID</label>
              <div className="register-input">
                <span className="field-icon"><UserIcon /></span>
                <input
                  type="text"
                  value={form.employeeId}
                  onChange={(e) => updateField("employeeId", e.target.value)}
                  placeholder="Enter employee ID"
                />
              </div>
            </div>

            <div className="register-field">
              <label>Mobile number</label>
              <div className="register-input">
                <span className="field-icon"><PhoneIcon /></span>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => updateField("mobile", e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
            </div>

            <div className="register-field">
              <label>Full name</label>
              <div className="register-input">
                <span className="field-icon"><UserIcon /></span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
            </div>

            <div className="register-field full-width">
              <label>Department / Ministry / Organization</label>
              <div className="register-input">
                <span className="field-icon"><BuildingIcon /></span>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => updateField("organization", e.target.value)}
                  placeholder="Chennai Petroleum Corporation Limited (CPCL)"
                />
              </div>
            </div>

            <div className="register-field">
              <label>Designation</label>
              <div className="register-input">
                <span className="field-icon"><BriefcaseIcon /></span>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => updateField("designation", e.target.value)}
                  placeholder="e.g. Procurement Officer"
                />
              </div>
            </div>

            <div className="register-field">
              <label>Procurement role</label>
              <div className="register-input select-input">
                <span className="field-icon"><BriefcaseIcon /></span>
                <select
                  value={form.procurementRole}
                  onChange={(e) => updateField("procurementRole", e.target.value)}
                >
                  <option value="procurement-officer">Procurement Officer</option>
                  <option value="buyer">Buyer</option>
                  <option value="approver">Approver</option>
                  <option value="admin">Organization Administrator</option>
                  <option value="verifier">Verification Officer</option>
                </select>
              </div>
            </div>
          </div>

          <label className="authorization-checkbox">
            <input
              type="checkbox"
              checked={authorized}
              onChange={(e) => setAuthorized(e.target.checked)}
            />
            <span className="custom-register-checkbox"></span>
            <span>I confirm that I am authorized to access procurement information.</span>
          </label>

          <div className="captcha-section">
            <label>Enter CAPTCHA Code</label>
            <div className="captcha-row">
              <div className="captcha-image"><span>{captcha}</span></div>
              <button type="button" className="captcha-refresh" onClick={refreshCaptcha}>
                <RefreshIcon /> Refresh
              </button>
              <div className="register-input captcha-input">
                <span className="field-icon"><ShieldIcon /></span>
                <input
                  type="text"
                  value={form.captcha}
                  onChange={(e) => updateField("captcha", e.target.value)}
                  placeholder="CAPTCHA"
                />
              </div>
            </div>
          </div>

          <button type="submit" className="primary-register-button" disabled={loading}>
            {loading ? "Processing..." : "Send Verification Code"}
          </button>
        </form>
      )}

      {/* STEP 2: OTP VERIFICATION */}
      {step === 2 && (
        <form className="register-card" onSubmit={handleVerifyOtp}>
          <div className="register-section-heading">
            <h2>Step 2: Enter OTP Code</h2>
            <p>Verification OTP has been generated for {form.email}</p>
          </div>

          <div style={{ margin: "20px 0", padding: "12px", background: "rgba(52, 211, 153, 0.15)", border: "1px solid #34d399", color: "#34d399", borderRadius: "8px", fontSize: "14px" }}>
             An OTP has been sent to your registered device.
          </div>

          <div className="register-field">
            <label>Enter 6-Digit Verification OTP</label>
            <div className="register-input">
              <span className="field-icon"></span>
              <input
                type="text"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="Enter 6-digit OTP code"
                maxLength={6}
              />
            </div>
          </div>

          <button type="submit" className="primary-register-button" disabled={loading}>
            {loading ? "Verifying OTP..." : "Verify OTP & Register"}
          </button>
        </form>
      )}

      {/* STEP 3: SUCCESS */}
      {step === 3 && (
        <div className="register-card">
          <div className="register-success" style={{ display: "flex", gap: "12px", padding: "20px", background: "rgba(52,211,153,0.15)", borderRadius: "8px" }}>
            <ShieldIcon />
            <div>
              <strong style={{ fontSize: "16px", color: "#34d399" }}>Account Registered Successfully!</strong>
              <p style={{ marginTop: "4px", color: "var(--text-main)" }}>
                Welcome, {form.fullName}. Your officer account is now active under {form.organization}.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="primary-register-button"
            onClick={onBack}
            style={{ marginTop: "20px" }}
          >
            Back to Login & Sign In
          </button>
        </div>
      )}
    </div>
  );
}

export default RegisterPage;