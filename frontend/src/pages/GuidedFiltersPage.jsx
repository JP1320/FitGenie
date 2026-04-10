import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const styles = ["Ethnic","Western","Indo-Western","Casual","Formal","Sportswear"];
const budgets = ["Under ₹500","₹500-₹1,000","₹1,000-₹2,000","₹2,000-₹5,000","Above ₹5,000"];
const fabrics = ["Cotton","Linen","Silk","Wool","Denim","Polyester / Blends"];

export default function GuidedFiltersPage() {
  const nav = useNavigate();
  const { style, budget, fabric, fitDetails, patch } = useFlowStore();

  function toggleFabric(item) {
    patch({ fabric: fabric.includes(item) ? fabric.filter(f => f !== item) : [...fabric, item] });
  }

  return (
    <PageShell className="bg-filters">
      <section className="card">
        <h2>Guided Visual Filters</h2>

        <label>Style</label>
        <select value={style} onChange={(e)=>patch({ style: e.target.value })}>
          <option value="">Select style</option>
          {styles.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <label>Budget</label>
        <select value={budget} onChange={(e)=>patch({ budget: e.target.value })}>
          <option value="">Select budget</option>
          {budgets.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <label>Fabric Preference (Optional)</label>
        <div className="row">
          {fabrics.map(v => <button key={v} className={`chip ${fabric.includes(v)?"active":""}`} onClick={() => toggleFabric(v)}>{v}</button>)}
        </div>

        <label>Fit Details</label>
        <div className="grid3">
          <input placeholder="Sleeve type" value={fitDetails.sleeve} onChange={(e)=>patch({ fitDetails: { ...fitDetails, sleeve: e.target.value } })} />
          <input placeholder="Length" value={fitDetails.length} onChange={(e)=>patch({ fitDetails: { ...fitDetails, length: e.target.value } })} />
          <select value={fitDetails.fit} onChange={(e)=>patch({ fitDetails: { ...fitDetails, fit: e.target.value } })}>
            <option value="">Fit type</option>
            <option>Slim</option>
            <option>Regular</option>
            <option>Oversized</option>
          </select>
        </div>

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/size-body")}>Back</button>
          <button className="btn" onClick={() => nav("/recommendations")}>Analyze Best Match</button>
        </div>
      </section>
    </PageShell>
  );
}
