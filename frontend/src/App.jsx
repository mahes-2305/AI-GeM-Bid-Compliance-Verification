import { useState } from "react";

import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import SSOPage from "./components/SSOPage";
import Dashboard from "./components/Dashboard";

import "./App.css";

function App() {
  const [page, setPage] = useState("login");

  const handleLogin = () => {
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
  };

  if (page === "dashboard") {
    return <Dashboard />;
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