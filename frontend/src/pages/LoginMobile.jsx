import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";
import { callApi } from "../services/api";
import { useFlowStore } from "../store/useFlowStore";

export default function LoginMobile() {
  const nav = useNavigate();
  const { patch } = useFlowStore();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    setLoading(true);
    const res = await callApi("/auth/otp", "POST", { phone, otp });
    setLoading(false);
    if (!res.ok) {
      setError(res.data?.message || "OTP verification failed. Try again.");
      return;
    }
    patch({ authUser: res.data.user, authToken: res.data.token });
    nav("/intent");
  }

  return (
    <StepShell step={1} title="Login with Mobile" className="bg-auth">
      <label>Mobile Number</label>
      <input
        placeholder="+91 9XXXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <label>OTP (mock)</label>
      <input
        placeholder="123456"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      {error && <p className="error-text">{error}</p>}
      <div className="row">
        <button className="btn" onClick={handleLogin} disabled={loading}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>
        <button className="btn ghost" onClick={() => nav("/welcome")}>
          Back
        </button>
      </div>
    </StepShell>
  );
}
