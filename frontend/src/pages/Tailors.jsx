import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { callApi } from "../services/api";

export default function Tailors() {
  const nav = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || "u_live_001";
  const [tailors, setTailors] = useState([]);

  const load = async () => {
    const r = await callApi("/tailors");
    if (r.ok) setTailors(r.data);
  };

  return (
    <section className="card">
      <h2>Step 4: Tailors</h2>
      <button className="btn" onClick={load}>Load Tailors</button>
      <ul>
        {tailors.map(t => <li key={t.id}>{t.name} • ⭐{t.rating} • {t.location}</li>)}
      </ul>
      <button className="btn ghost" onClick={() => nav("/booking", { state: { userId } })}>Next: Booking</button>
    </section>
  );
}
