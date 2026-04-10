import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

const ages = ["0-3","4-10","11-18","19-29","30-45","46-60","60+"];

export default function BasicProfilePage() {
  const nav = useNavigate();
  const { ageRange, gender, patch } = useFlowStore();

  return (
    <PageShell className="bg-profile">
      <section className="card">
        <h2>Basic Profile</h2>
        <label>Age</label>
        <select value={ageRange} onChange={(e)=>patch({ ageRange: e.target.value })}>
          <option value="">Select age range</option>
          {ages.map(a => <option key={a} value={a}>{a}</option>)}
        </select>

        <label>Gender</label>
        <div className="row">
          <button className={`chip ${gender==="Male"?"active":""}`} onClick={() => patch({ gender: "Male" })}>Male</button>
          <button className={`chip ${gender==="Female"?"active":""}`} onClick={() => patch({ gender: "Female" })}>Female</button>
        </div>

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/intent")}>Back</button>
          <button className="btn" onClick={() => nav("/size-body")}>Continue</button>
        </div>
      </section>
    </PageShell>
  );
}
