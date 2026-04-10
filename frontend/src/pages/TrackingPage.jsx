import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const steps = ["Accepted","In Progress","Stitching","Ready","Shipped / Ready for Pickup"];

export default function TrackingPage() {
  const nav = useNavigate();
  const { trackingStatus, patch } = useFlowStore();
  const idx = steps.indexOf(trackingStatus);

  return (
    <PageShell className="bg-tracking">
      <section className="card">
        <h2>Order Tracking Timeline</h2>
        <div className="timeline">
          {steps.map((s, i) => (
            <div key={s} className={`timelineStep ${i <= idx ? "done" : ""}`}>{s}</div>
          ))}
        </div>

        <label>Update Status (demo)</label>
        <select value={trackingStatus} onChange={(e)=>patch({ trackingStatus: e.target.value })}>
          {steps.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/fit-card")}>Back</button>
          <button className="btn" onClick={() => nav("/feedback")}>Delivery & Feedback</button>
        </div>
      </section>
    </PageShell>
  );
}
