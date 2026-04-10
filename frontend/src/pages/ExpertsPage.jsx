import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";
import { callApi } from "../services/api";

export default function ExpertsPage() {
  const nav = useNavigate();
  const { selectedExpert, patch } = useFlowStore();
  const [list, setList] = useState([]);

  async function load() {
    const r = await callApi("/tailors");
    if (r.ok) {
      const mapped = (r.data || []).map((x) => ({
        ...x,
        portfolio: ["look1.jpg", "look2.jpg"],
        priceRange: "₹1500 - ₹5000",
        reviews: 128,
        deliveryTime: "3-7 days",
        specialization: "Wedding / Casual"
      }));
      setList(mapped);
    }
  }

  return (
    <PageShell className="bg-experts">
      <section className="card">
        <h2>Select Expert</h2>
        <button className="btn" onClick={load}>Load Experts</button>

        <div className="grid2">
          {list.map((e) => (
            <article key={e.id} className={`expert ${selectedExpert?.id===e.id?"selected":""}`} onClick={() => patch({ selectedExpert: e })}>
              <h3>{e.name}</h3>
              <p>⭐ {e.rating} • {e.location}</p>
              <p>{e.specialization}</p>
              <p>{e.priceRange} • {e.deliveryTime}</p>
              <p>{e.reviews} reviews</p>
            </article>
          ))}
        </div>

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/quality-location")}>Back</button>
          <button className="btn" onClick={() => nav("/delivery")}>Continue</button>
        </div>
      </section>
    </PageShell>
  );
}
