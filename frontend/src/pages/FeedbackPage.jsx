import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

function Stars({ value, onChange }) {
  return (
    <div className="row">
      {[1,2,3,4,5].map(n => (
        <button key={n} className={`chip ${value>=n?"active":""}`} onClick={() => onChange(n)}>⭐ {n}</button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const nav = useNavigate();
  const { feedback, patch, reset } = useFlowStore();

  function done() {
    alert("Thank you! Feedback submitted.");
    reset();
    nav("/");
  }

  return (
    <PageShell className="bg-feedback">
      <section className="card">
        <h2>Delivery + Feedback</h2>
        <p>Delivery confirmed. Please rate your experience.</p>

        <label>Fit Accuracy</label>
        <Stars value={feedback.fit} onChange={(v)=>patch({ feedback: { ...feedback, fit: v } })} />

        <label>Service</label>
        <Stars value={feedback.service} onChange={(v)=>patch({ feedback: { ...feedback, service: v } })} />

        <label>Delivery</label>
        <Stars value={feedback.delivery} onChange={(v)=>patch({ feedback: { ...feedback, delivery: v } })} />

        <label>Upload Photo URL (optional)</label>
        <input value={feedback.photoUrl} onChange={(e)=>patch({ feedback: { ...feedback, photoUrl: e.target.value } })} />

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/tracking")}>Back</button>
          <button className="btn" onClick={done}>Submit Feedback</button>
        </div>
      </section>
    </PageShell>
  );
}
