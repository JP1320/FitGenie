import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "../components/layout/StepLayout";
import { useFlowStore } from "../app/store";
import { callApi } from "../services/api";

export default function Recommendations() {
  const nav = useNavigate();
  const { userId, preferences, setRecommendations, markStepCompleted } = useFlowStore();
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState(null);

  async function getRecos() {
    setLoading(true);
    const r = await callApi("/recommendations", "POST", {
      userId,
      preferences: {
        style: preferences.styles?.[0] || "casual",
        budget: 2000
      }
    });
    setLoading(false);
    if (r.ok) {
      setRecommendations(r.data);
      setOut(r.data);
      markStepCompleted("recommendations");
    }
  }

  return (
    <StepLayout
      step={4}
      total={8}
      title="Step 4 · AI Recommendations"
      subtitle="Generate personalized recommendations."
      actions={
        <>
          <button className="btn" onClick={getRecos} disabled={loading}>
            {loading ? "Generating..." : "Generate"}
          </button>
          <button className="btn ghost" onClick={() => nav("/tailors")}>Next</button>
        </>
      }
    >
      {out ? <pre>{JSON.stringify(out, null, 2)}</pre> : <p>No recommendations yet.</p>}
    </StepLayout>
  );
}
