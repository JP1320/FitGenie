import React, { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "https://fitgenie-26il.onrender.com";

export default function App() {
  const [userId, setUserId] = useState("u_live_001");
  const [name, setName] = useState("Ritesh");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function callApi(path, method = "GET", body) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = await res.json();
      setResult({ ok: res.ok, status: res.status, data });
    } catch (e) {
      setResult({ ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: "Arial", maxWidth: 900, margin: "20px auto", padding: 16 }}>
      <h1>FitGenie Live</h1>
      <p><b>API Base:</b> {API}</p>

      <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => callApi("/health")}>Health</button>
        <button onClick={() => callApi("/user/profile", "POST", { userId, name })}>Save Profile</button>
        <button onClick={() => callApi("/scan/body", "POST", { userId, measurements: { chest: 38, waist: 32 } })}>Scan Body</button>
        <button onClick={() => callApi("/recommendations", "POST", { userId, preferences: { style: "casual", budget: 2000 } })}>Get Recommendations</button>
        <button onClick={() => callApi("/tailors")}>Get Tailors</button>
        <button onClick={() => callApi("/booking", "POST", { userId, tailorId: "t1", slot: "2026-04-10T11:00:00Z" })}>Create Booking</button>
      </div>

      {loading && <p>Loading...</p>}

      <pre style={{ background: "#111", color: "#0f0", padding: 12, marginTop: 16, overflow: "auto" }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </main>
  );
}
