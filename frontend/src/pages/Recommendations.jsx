import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { callApi } from "../services/api";

export default function Recommendations() {
  const nav = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || "u_live_001";
  const [data, setData] = useState(null);

  const fetchRecos = async () => {
    const r = await callApi("/recommendations", "POST", { userId, preferences: { style: "casual", budget: 2000 } });
    if (r.ok) setData(r.data);
  };

  return (
    <section className="card">
      <h2>Step 3: Recommendations</h2>
      <button className="btn" onClick={fetchRecos}>Get My Outfits</button>
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button className="btn ghost" onClick={() => nav("/tailors", { state: { userId } })}>Next: Tailors</button>
    </section>
  );
}
