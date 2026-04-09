import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { callApi } from "../services/api";

export default function Scan() {
  const nav = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || "u_live_001";

  const submit = async () => {
    const r = await callApi("/scan/body", "POST", { userId, measurements: { chest: 38, waist: 32 } });
    if (r.ok) nav("/recommendations", { state: { userId } });
  };

  return (
    <section className="card">
      <h2>Step 2: Body Scan</h2>
      <p>Use sample measurements for MVP testing.</p>
      <button className="btn" onClick={submit}>Analyze Fit</button>
    </section>
  );
}
