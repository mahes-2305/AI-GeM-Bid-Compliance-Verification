import { useState } from "react";
import "./LoginPage.css";

function generateCaptcha() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let result = "";

  for (let i = 0; i < 5; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return result;
}

function LoginPage({ onLogin, onCreateAccount, onSSO }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

  const [languageOpen, setLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("EN");

  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");

  const languages = [
    {
      code: "ENG",
      label: "English",
    },
    {
      code: "TA",
      label: "தமிழ்",
    },
    {
      code: "HI",
      label: "हिंदी",
    },
  ];

  /* =========================
     CAPTCHA
     ========================= */

  const refreshCaptcha = () => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
    setCaptchaError("");
  };

  /* =========================
     LANGUAGE
     ========================= */

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.label);
    setLanguageOpen(false);
  };

  /* =========================
     VALIDATION
     ========================= */

  const validateForm = () => {
    let valid = true;

    setEmailError("");
    setPasswordError("");
    setCaptchaError("");

    if (!email.trim()) {
      setEmailError(
        "Please enter your email or employee ID."
      );
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError(
        "Please enter your password."
      );
      valid = false;
    }

    if (!captchaInput.trim()) {
      setCaptchaError(
        "Please enter the CAPTCHA code."
      );
      valid = false;
    } else if (
      captchaInput.trim().toUpperCase() !==
      captcha.toUpperCase()
    ) {
      setCaptchaError(
        "Invalid CAPTCHA code. Please try again."
      );
      valid = false;
    }

    return valid;
  };

  /* =========================
     SIGN IN
     ========================= */

  const handleSignIn = (event) => {
    event.preventDefault();

    const valid = validateForm();

    if (!valid) {
      return;
    }

    /*
      Both fields + CAPTCHA are valid.
      Tell App.jsx to open Dashboard.
    */

    if (typeof onLogin === "function") {
      onLogin({
        email: email.trim(),
        password,
        rememberMe,
      });
    }
  };

  /* =========================
     INPUT HANDLERS
     ========================= */

  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    if (emailError) {
      setEmailError("");
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);

    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleCaptchaChange = (event) => {
    setCaptchaInput(event.target.value);

    if (captchaError) {
      setCaptchaError("");
    }
  };

  /* =========================
     OTHER BUTTONS
     ========================= */

  const handleCreateAccount = () => {
    if (typeof onCreateAccount === "function") {
      onCreateAccount();
    }
  };

  const handleSSO = () => {
    if (typeof onSSO === "function") {
      onSSO();
    }
  };

  return (
    <div className="login-page">

      <div className="login-background-overlay"></div>

      <div className="login-content">

        {/* =====================================
            LEFT BRANDING
            ===================================== */}

        <div className="branding-section">

          <img
            src="/src/assets/nexverify-logo.png"
            alt="NexVerify AI"
            className="nexverify-logo"
          />

          <div className="verification-title">
            VERIFICATION PLATFORM
          </div>

          <div className="title-line"></div>

          <div className="security-icon">
            <svg
              viewBox="0 0 64 64"
              xmlns="http://www.w3.org/2000/svg"
            >
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

          <h2 className="brand-heading">
            Intelligent. Automated. Compliant.
          </h2>

          <p className="brand-description">
            Built for the future of GeM procurement.
          </p>

        </div>

        {/* =====================================
            LOGIN CARD
            ===================================== */}

        <div className="login-card">

          {/* LANGUAGE */}

          <div className="language-wrapper">

            <button
              type="button"
              className="language-button"
              onClick={() =>
                setLanguageOpen(
                  (previous) => !previous
                )
              }
              aria-expanded={languageOpen}
            >

              <span className="globe-icon">

                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M3 12H21"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M12 3C9.5 5.5 8.5 8.5 8.5 12C8.5 15.5 9.5 18.5 12 21"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M12 3C14.5 5.5 15.5 8.5 15.5 12C15.5 15.5 14.5 18.5 12 21"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>

              </span>

              <span className="selected-language">
                {selectedLanguage}
              </span>

              <span
                className={`language-arrow ${
                  languageOpen
                    ? "language-arrow-open"
                    : ""
                }`}
              >
                ▾
              </span>

            </button>

            {languageOpen && (
              <div className="language-menu">

                {languages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    className={`language-option ${
                      selectedLanguage === language.label
                        ? "language-option-active"
                        : ""
                    }`}
                    onClick={() =>
                      handleLanguageSelect(language)
                    }
                  >
                    {language.label}
                  </button>
                ))}

              </div>
            )}

          </div>

          {/* =====================================
              LOGIN FORM
              ===================================== */}

          <form
            className="login-form"
            onSubmit={handleSignIn}
            noValidate
          >

            {/* EMAIL */}

            <div className="form-group">

              <label htmlFor="email">
                Email / Employee ID
              </label>

              <div
                className={`input-wrapper ${
                  emailError
                    ? "input-error"
                    : ""
                }`}
              >

                <span className="input-icon">

                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M4 7L12 13L20 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                </span>

                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter email or employee ID"
                  autoComplete="username"
                />

              </div>

              {emailError && (
                <div className="error-message">
                  {emailError}
                </div>
              )}

            </div>

            {/* PASSWORD */}

            <div className="form-group password-group">

              <label htmlFor="password">
                Password
              </label>

              <div
                className={`input-wrapper ${
                  passwordError
                    ? "input-error"
                    : ""
                }`}
              >

                <span className="input-icon">

                  <svg
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M8 10V7C8 4.8 9.8 3 12 3C14.2 3 16 4.8 16 7V10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (

                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 12C4.7 7.5 8 5.3 12 5.3C16 5.3 19.3 7.5 21.5 12C19.3 16.5 16 18.7 12 18.7C8 18.7 4.7 16.5 2.5 12Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                    </svg>

                  ) : (

                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 3L21 21"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />

                      <path
                        d="M10.6 5.5C11.1 5.4 11.5 5.3 12 5.3C16 5.3 19.3 7.5 21.5 12C20.7 13.7 19.7 15.1 18.5 16.2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />

                      <path
                        d="M6.2 6.2C4.7 7.5 3.5 9.3 2.5 12C4.7 16.5 8 18.7 12 18.7C13.5 18.7 14.9 18.3 16.1 17.7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>

                  )}

                </button>

              </div>

              {passwordError && (
                <div className="error-message">
                  {passwordError}
                </div>
              )}

            </div>

            {/* CAPTCHA */}

            <div className="captcha-group">

              <label>
                Enter CAPTCHA Code
              </label>

              <div className="captcha-row">

                <div className="captcha-display">
                  {captcha}
                </div>

                <button
                  type="button"
                  className="captcha-refresh"
                  onClick={refreshCaptcha}
                >
                  ↻
                  <span>Refresh</span>
                </button>

                <div
                  className={`captcha-input-wrapper ${
                    captchaError
                      ? "captcha-input-error"
                      : ""
                  }`}
                >

                  <span className="captcha-icon">

                    <svg
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 3L19 6V11.5C19 16.2 16.1 20 12 21C7.9 20 5 16.2 5 11.5V6L12 3Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />

                      <path
                        d="M9 12L11 14L15 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                  </span>

                  <input
                    type="text"
                    value={captchaInput}
                    onChange={handleCaptchaChange}
                    placeholder="Enter CAPTCHA code"
                    maxLength={5}
                    autoComplete="off"
                  />

                </div>

              </div>

              {captchaError && (
                <div className="captcha-error">
                  {captchaError}
                </div>
              )}

            </div>

            {/* REMEMBER + FORGOT */}

            <div className="login-options">

              <label className="remember-option">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(
                      event.target.checked
                    )
                  }
                />

                <span className="custom-checkbox"></span>

                <span>
                  Remember me
                </span>

              </label>

              <button
                type="button"
                className="forgot-password"
                onClick={() => {
                  alert(
                    "Password recovery will be available here."
                  );
                }}
              >
                Forgot password?
              </button>

            </div>

            {/* SIGN IN */}

            <button
              type="submit"
              className="sign-in-button"
            >
              Sign In
            </button>

            {/* OR */}

            <div className="divider">

              <div className="divider-line"></div>

              <span>or</span>

              <div className="divider-line"></div>

            </div>

            {/* SSO */}

            <button
              type="button"
              className="sso-button"
              onClick={handleSSO}
            >

              <span className="sso-icon">

                <svg
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3L19 6V11.5C19 16.2 16.1 20 12 21C7.9 20 5 16.2 5 11.5V6L12 3Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M9 12L11 14L15 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </span>

              <span>
                Sign in with SSO
              </span>

            </button>

            {/* FOOTER */}

            <div className="login-footer">

              <span>
                Need help?
              </span>

              <button
                type="button"
                className="contact-support"
                onClick={() => {
                  alert(
                    "Please contact your organization administrator."
                  );
                }}
              >
                Contact Support
              </button>

              <span className="footer-separator">
                |
              </span>

              <button
                type="button"
                className="create-account"
                onClick={handleCreateAccount}
              >
                Create account
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default LoginPage;