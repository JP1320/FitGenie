import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";
import { callApi } from "../services/api";
import { useFlowStore } from "../store/useFlowStore";

export default function LoginEmail() {
  const nav = useNavigate();
  const { patch } = useFlowStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    const res = await callApi("/auth/login", "POST", { email, password });
    setLoading(false);
    if (!res.ok) {
      setError(res.data?.message || "Login failed. Try again.");
      return;
    }
    patch({ authUser: res.data.user, authToken: res.data.token });
    nav("/intent");
  }

  return (
    <StepShell step={1} title="Login with Email" className="bg-auth">
      <label>Email</label>
      <input
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <label>Password</label>
      <input
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error-text">{error}</p>}
      <div className="row">
        <button className="btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
        <button className="btn ghost" onClick={() => nav("/welcome")}>
          Back
        </button>
      </div>
    </StepShell>
  );
}
