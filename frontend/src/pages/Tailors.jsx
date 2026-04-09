import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "../components/layout/StepLayout";
import { useFlowStore } from "../app/store";
import { callApi } from "../services/api";

export default function Tailors() {
  const nav = useNavigate();
  const { setTailors, markStepCompleted } = useFlowStore();
  const [list, setList] = useState([]);

  async function load() {
    const r = await callApi("/tailors");
    if (r.ok) {
      setList(r.data);
      setTailors(r.data);
      markStepCompleted("tailors");
    }
  }

  return (
    <StepLayout
      step={5}
      total={8}
      title="Step 5 · Tailor Discovery"
      subtitle="Browse available partners."
      actions={
        <>
          <button className="btn" onClick={load}>Load Tailors</button>
          <button className="btn ghost" onClick={() => nav("/booking")}>Next</button>
        </>
      }
    >
      {list.length === 0 ? <p>No tailors loaded yet.</p> : (
        <ul>
          {list.map((t) => (
            <li key={t.id}>{t.name} · ⭐{t.rating} · {t.location}</li>
          ))}
        </ul>
      )}
    </StepLayout>
  );
}
