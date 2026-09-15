import { useState } from "react";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import SSOPage from "./components/SSOPage";
import Dashboard from "./components/Dashboard";
import BidderDashboard from "./components/BidderDashboard";

import "./App.css";

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  // Normal login = BIDDER
  const handleLogin = (formData) => {
    setUser({
      role: "bidder",
      name: "Bidder User",
      email: formData?.email || "",
    });

    setPage("bidder");
  };

  // SSO login = PROCUREMENT OFFICER
  const handleSSOLogin = (formData) => {
    setUser({
      role: "officer",
      name: "Priya Menon",
      email: formData?.email || "priya.menon@gov.in",
      organization: formData?.organization || "Government Procurement Department",
    });

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

  // PROCUREMENT OFFICER
  if (page === "dashboard" && user?.role === "officer") {
    return (
      <Dashboard
        userName={user.name}
        onLogout={handleLogout}
      />
    );
  }

  // BIDDER
  if (page === "bidder" && user?.role === "bidder") {
    return (
      <BidderDashboard
        userName={user.name}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "register") {
    return (
      <RegisterPage
        onBack={handleBackToLogin}
      />
    );
  }

  if (page === "sso") {
    return (
      <SSOPage
        onBack={handleBackToLogin}
        onLogin={handleSSOLogin}
      />
    );
  }

  return (
    <LoginPage
      onLogin={handleLogin}
      onCreateAccount={handleCreateAccount}
      onSSO={handleSSO}
    />
  );
}

export default App;