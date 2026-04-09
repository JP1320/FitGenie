import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { callApi } from "../services/api";

export default function Booking() {
  const nav = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId || "u_live_001";
  const [slot, setSlot] = useState("2026-04-10T11:00:00Z");

  const book = async () => {
    const r = await callApi("/booking", "POST", { userId, tailorId: "t1", slot });
    if (r.ok) nav("/success", { state: { booking: r.data } });
  };

  return (
    <section className="card">
      <h2>Step 5: Booking</h2>
      <input value={slot} onChange={(e)=>setSlot(e.target.value)} />
      <button className="btn" onClick={book}>Confirm Booking</button>
    </section>
  );
}
