import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

export default function QualityLocationPage() {
  const nav = useNavigate();
  const { ratingFilter, locationFilter, patch } = useFlowStore();

  return (
    <PageShell className="bg-quality">
      <section className="card">
        <h2>Quality & Location Filters</h2>
        <label>Rating Filter</label>
        <div className="row">
          {["3+","4+","4.5+"].map(v => (
            <button key={v} className={`chip ${ratingFilter===v?"active":""}`} onClick={() => patch({ ratingFilter: v })}>⭐ {v}</button>
          ))}
        </div>

        <label>Location</label>
        <div className="row">
          {["Near Me","Within City","Anywhere (online)"].map(v => (
            <button key={v} className={`chip ${locationFilter===v?"active":""}`} onClick={() => patch({ locationFilter: v })}>{v}</button>
          ))}
        </div>

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/service-type")}>Back</button>
          <button className="btn" onClick={() => nav("/experts")}>Find Experts</button>
        </div>
      </section>
    </PageShell>
  );
}
