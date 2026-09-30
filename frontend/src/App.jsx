import { useState } from "react";

import GovtTopHeader from "./components/GovtTopHeader";
import GovtFooter from "./components/GovtFooter";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import SSOPage from "./components/SSOPage";
import Dashboard from "./components/Dashboard";
import BidderDashboard from "./components/BidderDashboard";

import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  // Authenticated Login (Bidder or Officer)
  const handleLogin = (authData) => {
    const authenticatedUser = authData?.user || {
      role: "officer",
      name: "Priya Menon",
      email: authData?.email || "priya.menon@cpcl.gov.in",
      organization: "Chennai Petroleum Corporation Limited (CPCL / MoPNG)",
      designation: "Senior Compliance Officer",
    };

    setUser(authenticatedUser);

    if (authenticatedUser.role === "bidder") {
      setPage("bidder");
    } else {
      setPage("dashboard");
    }
  };

  // SSO Login (Procurement Officer)
  const handleSSOLogin = (authData) => {
    const ssoUser = authData?.user || {
      role: "officer",
      name: "Murthuj",
      email: authData?.email || "priya.menon@cpcl.gov.in",
      organization: authData?.organization || "Government Procurement Department",
      designation: "Chief Procurement Officer",
    };

    setUser(ssoUser);
    setPage("dashboard");
  };

  const handleCreateAccount = () => {
    setPage("register");
  };

  const handleSSO = () => {
    setPage("sso");
  };

  const handleBackToLogin = () => {
    setPage("login");
    setUser(null);
  };

  const handleLogout = () => {
    setUser(null);
    setPage("login");
  };

  return (
    <div className="app-main-wrapper" style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* GLOBAL PRODUCTION GOVERNMENT TOP HEADER & ACCESSIBILITY BAR */}
      <GovtTopHeader />

      <div className="app-page-content" style={{ flex: 1 }}>
        {/* PROCUREMENT OFFICER DASHBOARD */}
        {page === "dashboard" && user?.role === "officer" && (
          <Dashboard
            userName={user.name}
            userProfile={user}
            onLogout={handleLogout}
          />
        )}

        {/* BIDDER DASHBOARD */}
        {page === "bidder" && user?.role === "bidder" && (
          <BidderDashboard
            userName={user.name}
            userProfile={user}
            onLogout={handleLogout}
          />
        )}

        {page === "register" && (
          <RegisterPage
            onBack={handleBackToLogin}
          />
        )}

        {page === "sso" && (
          <SSOPage
            onBack={handleBackToLogin}
            onLogin={handleSSOLogin}
          />
        )}

        {page === "login" && (
          <LoginPage
            onLogin={handleLogin}
            onCreateAccount={handleCreateAccount}
            onSSO={handleSSO}
          />
        )}
      </div>

      {/* GLOBAL PRODUCTION GOVERNMENT FOOTER */}
      <GovtFooter />
    </div>
  );
}

export default App;