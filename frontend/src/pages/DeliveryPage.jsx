import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

export default function DeliveryPage() {
  const nav = useNavigate();
  const { deliveryMode, schedule, chatEnabled, patch } = useFlowStore();

  return (
    <PageShell className="bg-delivery">
      <section className="card">
        <h2>Delivery & Interaction</h2>
        <label>Delivery Mode</label>
        <div className="row">
          {["Online","Offline","Both"].map(v => (
            <button key={v} className={`chip ${deliveryMode===v?"active":""}`} onClick={() => patch({ deliveryMode: v })}>{v}</button>
          ))}
        </div>

        <label>Calendar Scheduling</label>
        <input type="datetime-local" value={schedule} onChange={(e)=>patch({ schedule: e.target.value })} />

        <label className="checkbox">
          <input type="checkbox" checked={chatEnabled} onChange={(e)=>patch({ chatEnabled: e.target.checked })} />
          Enable Chat with Expert
        </label>

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/experts")}>Back</button>
          <button className="btn" onClick={() => nav("/fit-card")}>Generate Fit Card</button>
        </div>
      </section>
    </PageShell>
  );
}
