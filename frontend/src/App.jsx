import { useState } from "react";
import LoginPage from "./components/LoginPage";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [isAuthed, setIsAuthed] = useState(false);

  const handleSignIn = (formData) => {
    // TODO: replace with your real auth API call.
    // For now, any submit takes you to the dashboard.
    console.log("Signing in:", formData.identifier);
    setIsAuthed(true);
  };

  return isAuthed ? <Dashboard /> : <LoginPage onSignIn={handleSignIn} />;
}
