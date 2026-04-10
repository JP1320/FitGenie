import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const types = ["Custom Stitching (Tailor)","Designer Wear","Ready-made + Alteration (Boutique)","Personal Styling"];

export default function ServiceTypePage() {
  const nav = useNavigate();
  const { serviceType, patch } = useFlowStore();

  return (
    <PageShell className="bg-service">
      <section className="card">
        <h2>Choose Service Type</h2>
        <div className="grid2">
          {types.map(v => (
            <button key={v} className={`chip big ${serviceType===v?"active":""}`} onClick={() => patch({ serviceType: v })}>{v}</button>
          ))}
        </div>
        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/recommendations")}>Back</button>
          <button className="btn" onClick={() => nav("/quality-location")}>Continue</button>
        </div>
      </section>
    </PageShell>
  );
}
