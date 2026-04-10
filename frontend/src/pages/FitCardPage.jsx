import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

export default function FitCardPage() {
  const nav = useNavigate();
  const state = useFlowStore();
  const { patch } = state;

  function generateFitCard() {
    const card = {
      measurements: {
        bodyType: state.bodyType || state.scanResult?.bodyProportion || "Not Provided",
        size: state.size || state.scanResult?.recommendedSize || "Not Provided",
        height: state.heightCm || state.scanResult?.detectedHeightCm || "Not Provided"
      },
      stylePreferences: {
        style: state.style || "Not Provided",
        fabric: state.fabric,
        fit: state.fitDetails
      },
      selectedService: state.serviceType,
      selectedExpert: state.selectedExpert,
      deliveryMode: state.deliveryMode,
      schedule: state.schedule,
      notes: "Auto-generated Fit Card shared with both user and expert."
    };
    patch({ fitCard: card });
  }

  return (
    <PageShell className="bg-fitcard">
      <section className="card">
        <h2>Auto-generated Fit Card</h2>
        <button className="btn" onClick={generateFitCard}>Generate / Refresh Fit Card</button>

        {state.fitCard && <pre>{JSON.stringify(state.fitCard, null, 2)}</pre>}

        <p>✅ Sent to selected tailor/designer (mock flow)</p>
        <p>✅ Sent to user dashboard with contact/address details (mock flow)</p>

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/delivery")}>Back</button>
          <button className="btn" onClick={() => nav("/tracking")}>Track Order</button>
        </div>
      </section>
    </PageShell>
  );
}
