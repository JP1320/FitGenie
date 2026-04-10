import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";
import { callApi } from "../services/api";

export default function RecommendationsPage() {
  const nav = useNavigate();
  const { userId, style, budget, patch, recommendations } = useFlowStore();
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    const r = await callApi("/recommendations", "POST", {
      userId,
      preferences: { style: style || "casual", budget: budget || "₹1,000-₹2,000" }
    });
    setLoading(false);
    if (r.ok) patch({ recommendations: r.data });
  }

  return (
    <PageShell className="bg-reco">
      <section className="card">
        <h2>AI Recommendation Engine</h2>
        <p>Suggested outfits + fit confidence + why this suits you.</p>
        <button className="btn" onClick={generate} disabled={loading}>{loading ? "Generating..." : "Generate Recommendations"}</button>

        {recommendations && (
          <div className="result">
            <pre>{JSON.stringify(recommendations, null, 2)}</pre>
          </div>
        )}

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/guided-filters")}>Back</button>
          <button className="btn" onClick={() => nav("/service-type")}>Confirm & Continue</button>
        </div>
      </section>
    </PageShell>
  );
}
