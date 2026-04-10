import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const bodyTypes = [
  "Rectangle","Triangle / Pear","Inverted Triangle","Oval / Round","Hourglass"
];
const sizes = ["XS","S","M","L","XL","2XL","3XL","4XL","5XL"];
const heightRanges = ["Below 150 cm","150-160 cm","161-170 cm","171-180 cm","181-190 cm","Above 190 cm"];

export default function SizeBodyPage() {
  const nav = useNavigate();
  const { bodyType, size, heightCm, heightRange, patch } = useFlowStore();

  return (
    <PageShell className="bg-body">
      <section className="card">
        <h2>Smart Size & Body Input</h2>
        <p>All fields optional. You can skip this section.</p>

        <label>Body Type (Optional)</label>
        <select value={bodyType} onChange={(e)=>patch({ bodyType: e.target.value })}>
          <option value="">Select body type</option>
          {bodyTypes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <label>Size (Optional)</label>
        <select value={size} onChange={(e)=>patch({ size: e.target.value })}>
          <option value="">Select size</option>
          {sizes.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <label>Height in cm (Optional)</label>
        <input value={heightCm} onChange={(e)=>patch({ heightCm: e.target.value })} placeholder="e.g. 172" />

        <label>OR Height Range</label>
        <select value={heightRange} onChange={(e)=>patch({ heightRange: e.target.value })}>
          <option value="">Select height range</option>
          {heightRanges.map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/basic-profile")}>Back</button>
          <button className="btn ghost" onClick={() => nav("/guided-filters")}>Skip</button>
          <button className="btn" onClick={() => nav("/camera-scan")}>Use AI Fit Scanner</button>
        </div>
      </section>
    </PageShell>
  );
}
