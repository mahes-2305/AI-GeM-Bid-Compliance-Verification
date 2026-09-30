import { useState } from "react";
import { useLanguage, GlobalLanguageSelector } from "../context/LanguageContext";
import "./LoginPage.css";

function generateCaptcha() {
  const characters = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return result;
}

function LoginPage({ onLogin, onCreateAccount, onSSO }) {
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [loginMode, setLoginMode] = useState("password"); // "password" or "otp"

  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError("");
  };

  /* =========================
     SEND OTP API CALL
     ========================= */
  const handleSendOtp = async () => {
    if (!email.trim()) {
      setEmailError("Please enter email or officer ID first.");
      return;
    }
    setEmailError("");
    setOtpNotice("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email.trim(), channel: "both" }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setOtpSent(true);
        setOtpNotice(` OTP sent to your registered mobile number.`);
      } else {
        setOtpError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setOtpError("Network error while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     VALIDATION & SIGN IN
     ========================= */
  const validateForm = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    setOtpError("");
    setCaptchaError("");

    if (!email.trim()) {
      setEmailError("Please enter your official email or ID.");
      valid = false;
    }

    if (loginMode === "password" && !password.trim()) {
      setPasswordError("Please enter password.");
      valid = false;
    }

    if (loginMode === "otp" && !otpInput.trim()) {
      setOtpError("Please enter the 6-digit OTP code.");
      valid = false;
    }

    if (!captchaInput.trim()) {
      setCaptchaError("Please enter CAPTCHA code.");
      valid = false;
    } else if (captchaInput.trim() !== captcha) {
      setCaptchaError("Invalid CAPTCHA code. Please match case.");
      valid = false;
    }

    return valid;
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          captchaInput: captchaInput.trim(),
          captchaExpected: captcha,
          otp: otpInput.trim(),
          loginType: loginMode,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        if (loginMode === "otp") setOtpError(data.message || "Login failed");
        else setPasswordError(data.message || "Login failed");
        refreshCaptcha();
        return;
      }

      if (typeof onLogin === "function") {
        onLogin({
          token: data.token,
          user: data.user,
          email: email.trim(),
          rememberMe,
        });
      }
    } catch (err) {
      setPasswordError("Authentication request failed. Backend server unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background-overlay"></div>

      {/* The Global Govt Header is handled by App.jsx, removed duplicate local header */}

      <div className="login-content" style={{ marginTop: "40px" }}>

        {/* LEFT BRANDING */}
        <div className="branding-section">
          <img
            src="/nexverify-logo.png"
            alt="NexVerify AI"
            className="nexverify-logo"
          />
          <div className="verification-title">{t("portalTitle")}</div>
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
          <h2 className="brand-heading">{t("ministry")}</h2>
          <p className="brand-description">{t("unit")}</p>
        </div>

        {/* LOGIN CARD */}
        <div className="login-card">
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "12px", background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", padding: "3px 10px", borderRadius: "12px", fontWeight: "600" }}>
               {t("secureLogin")}
            </span>
          </div>

          {/* MODE TABS: Password vs OTP */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "18px", background: "rgba(0, 0, 0, 0.1)", padding: "4px", borderRadius: "8px" }}>
            <button
              type="button"
              onClick={() => { setLoginMode("password"); setOtpError(""); setPasswordError(""); }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                background: loginMode === "password" ? "#2563eb" : "transparent",
                color: loginMode === "password" ? "var(--text-main)" : "#94a3b8",
                transition: "all 0.2s"
              }}
            >
              {t("passwordTab")}
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode("otp"); setOtpError(""); setPasswordError(""); }}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "6px",
                border: "none",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                background: loginMode === "otp" ? "#2563eb" : "transparent",
                color: loginMode === "otp" ? "var(--text-main)" : "#94a3b8",
                transition: "all 0.2s"
              }}
            >
              {t("otpTab")}
            </button>
          </div>

          {/* LOGIN FORM */}
          <form className="login-form" onSubmit={handleSignIn} noValidate>
            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="email">{t("emailLabel")}</label>
              <div className={`input-wrapper ${emailError ? "input-error" : ""}`}>
                <span className="input-icon"></span>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  placeholder="name@cpcl.gov.in"
                />
              </div>
              {emailError && <div className="error-message">{emailError}</div>}
            </div>

            {/* PASSWORD MODE */}
            {loginMode === "password" && (
              <div className="form-group password-group">
                <label htmlFor="password">{t("passwordLabel")}</label>
                <div className={`input-wrapper ${passwordError ? "input-error" : ""}`}>
                  <span className="input-icon"></span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "" : ""}
                  </button>
                </div>
                {passwordError && <div className="error-message">{passwordError}</div>}
              </div>
            )}

            {/* OTP MODE */}
            {loginMode === "otp" && (
              <div className="form-group">
                <label>{t("otpLabel")}</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div className={`input-wrapper ${otpError ? "input-error" : ""}`} style={{ flex: 1 }}>
                    <span className="input-icon"></span>
                    <input
                      type="text"
                      value={otpInput}
                      onChange={(e) => { setOtpInput(e.target.value); setOtpError(""); }}
                      placeholder="Enter 6-digit OTP code"
                      maxLength={6}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
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
                    {loading ? "..." : t("sendOtp")}
                  </button>
                </div>
                {otpNotice && <div style={{ fontSize: "12px", color: "#34d399", marginTop: "4px" }}>{otpNotice}</div>}
                {otpError && <div className="error-message">{otpError}</div>}
              </div>
            )}

            {/* CAPTCHA */}
            <div className="captcha-group">
              <label>{t("captchaLabel")}</label>
              <div className="captcha-top-row">
                <div className="captcha-display">{captcha}</div>
                <button type="button" className="captcha-refresh" onClick={refreshCaptcha}>
                  {t("refreshCaptcha")}
                </button>
              </div>
              <div className={`input-wrapper captcha-input-wrapper ${captchaError ? "input-error" : ""}`}>
                <span className="input-icon"></span>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => { setCaptchaInput(e.target.value); setCaptchaError(""); }}
                  placeholder="Enter 5-character CAPTCHA"
                  maxLength={5}
                />
              </div>
              {captchaError && <div className="error-message">{captchaError}</div>}
            </div>

            {/* REMEMBER ME + FORGOT */}
            <div className="login-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="custom-checkbox"></span>
                <span>{t("rememberMe")}</span>
              </label>
              <button
                type="button"
                className="forgot-password"
                onClick={() => alert("Password recovery: Contact CPCL / MoPNG IT Admin.")}
              >
                {t("forgotPassword")}
              </button>
            </div>

            {/* SIGN IN BUTTON */}
            <button type="submit" className="sign-in-button" disabled={loading}>
              {loading ? "Authenticating..." : (loginMode === "otp" ? t("signInOtp") : t("signIn"))}
            </button>

            {/* DIVIDER */}
            <div className="divider">
              <div className="divider-line"></div>
              <span>{t("or")}</span>
              <div className="divider-line"></div>
            </div>

            {/* SSO BUTTON */}
            <button type="button" className="sso-button" onClick={onSSO}>
              <span className="sso-icon"></span>
              <span>{t("sso")}</span>
            </button>

            {/* FOOTER */}
            <div className="login-footer">
              <button type="button" className="create-account" onClick={onCreateAccount}>
                {t("createAccount")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;