import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "../components/layout/StepLayout";
import { useFlowStore } from "../app/store";
import { callApi } from "../services/api";

export default function Scan() {
  const nav = useNavigate();
  const { userId, setScan, markStepCompleted, markStepSkipped } = useFlowStore();
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");

  async function submit() {
    const payload = { userId, measurements: { chest: Number(chest) || 38, waist: Number(waist) || 32 } };
    const r = await callApi("/scan/body", "POST", payload);
    if (r.ok) {
      setScan({ chest, waist, confidence: r.data?.data?.confidence || null });
      markStepCompleted("scan");
      nav("/recommendations");
    }
  }

  function skip() {
    markStepSkipped("scan");
    nav("/recommendations");
  }

  return (
    <StepLayout
      step={3}
      total={8}
      title="Step 3 · Body Scan"
      subtitle="Enter manual values or skip this step."
      actions={
        <>
          <button className="btn" onClick={submit}>Analyze & Continue</button>
          <button className="btn ghost" onClick={skip}>Skip for now</button>
        </>
      }
    >
      <label>Chest (optional)</label>
      <input value={chest} onChange={(e) => setChest(e.target.value)} />
      <label>Waist (optional)</label>
      <input value={waist} onChange={(e) => setWaist(e.target.value)} />
    </StepLayout>
  );
}
