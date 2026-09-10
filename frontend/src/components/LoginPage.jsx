import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Globe, ChevronDown, ShieldCheck } from "lucide-react";
import logo from "../assets/nexverify-logo.png";
import "./LoginPage.css";

const LoginPage = ({ onSignIn }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "", remember: false });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSignIn?.(form);
  };

  return (
    <div className="login-page">
      {/* ================= BACKGROUND ================= */}
      <div className="background">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="ambient ambient-three" />
        <div className="ambient ambient-four" />

        <div className="orbit-container">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <div className="orbit-dot orbit-dot-one" />
          <div className="orbit-dot orbit-dot-two" />
        </div>

        <div className="vertical-design">
          <span /><span /><span />
        </div>

        <div className="dot-grid">
          {Array.from({ length: 28 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        <div className="light-streak" />

        <div className="wave-area">
          <svg className="waves" viewBox="0 0 1536 430" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveFlow" x1="0" y1="0" x2="1" y2="0.3">
                <stop offset="0%" stopColor="#5b8dff" />
                <stop offset="45%" stopColor="#9b6cf6" />
                <stop offset="100%" stopColor="#f0a8dc" />
              </linearGradient>
            </defs>
            <path
              className="wave wave-back"
              d="M0,180 C300,100 550,260 850,180 C1150,100 1350,240 1536,160"
            />
            <path
              className="wave wave-middle"
              d="M0,230 C300,150 560,310 860,230 C1160,150 1360,290 1536,210"
            />
            <path
              className="wave wave-purple"
              d="M0,262 C280,190 520,332 820,255 C1120,178 1340,312 1536,235"
            />
            <path
              className="wave wave-front"
              d="M0,300 C300,220 560,380 860,300 C1160,220 1360,360 1536,285"
            />
            <path
              className="wave wave-highlight"
              d="M0,285 C300,205 560,365 860,285 C1160,205 1360,345 1536,270"
            />
          </svg>
        </div>
      </div>

      {/* ================= BRAND SECTION ================= */}
      <div className="brand-section">
        <div className="brand-content">
          <img src={logo} alt="NexVerify AI" className="brand-logo-img" />

          <p className="brand-subtitle">Verification Platform</p>

          <div className="brand-divider" />

          <div className="security-section">
            <ShieldCheck className="icon" strokeWidth={1.7} />
            <h3>Intelligent. Automated. Compliant.</h3>
            <p>Built for the future of GeM procurement.</p>
          </div>
        </div>
      </div>

      {/* ================= LOGIN CARD ================= */}
      <div className="login-section">
        <div className="login-card">
          <button type="button" className="language-selector">
            <Globe className="globe-icon" />
            EN
            <ChevronDown className="chevron" />
          </button>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="identifier">Email / Employee ID</label>
              <div className="input-wrapper">
                <Mail className="field-icon" />
                <input
                  id="identifier"
                  type="text"
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="Enter email or employee ID"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group password-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="field-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="eye-icon" /> : <Eye className="eye-icon" />}
                </button>
              </div>
            </div>

            <div className="options-row">
              <label className="remember">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                />
                <span className="custom-checkbox" />
                Remember me
              </label>
              <button type="button" className="forgot-password">
                Forgot password?
              </button>
            </div>

            <button type="submit" className="sign-in-button">
              Sign In
            </button>

            <div className="divider">
              <span />
              <strong>or</strong>
              <span />
            </div>

            <button type="button" className="sso-button">
              <ShieldCheck className="icon" />
              Sign in with SSO
            </button>
          </form>

          <div className="support">
            Need help? <button type="button">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
