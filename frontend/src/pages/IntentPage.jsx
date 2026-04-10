import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

export default function IntentPage() {
  const nav = useNavigate();
  const { intent, intentSubType, patch } = useFlowStore();

  return (
    <PageShell className="bg-intent">
      <section className="card">
        <h2>For whom do you want to purchase?</h2>
        <div className="grid3">
          <button className={`chip ${intent==="myself"?"active":""}`} onClick={() => patch({ intent: "myself", intentSubType: "" })}>For Myself</button>
          <button className={`chip ${intent==="someone"?"active":""}`} onClick={() => patch({ intent: "someone", intentSubType: "" })}>For Someone Else</button>
          <button className={`chip ${intent==="gift"?"active":""}`} onClick={() => patch({ intent: "gift", intentSubType: "" })}>Gift / Occasion</button>
        </div>

        {intent === "someone" && (
          <div className="grid4">
            {["Partner","Family Member","Friend","Child"].map(v => (
              <button key={v} className={`chip ${intentSubType===v?"active":""}`} onClick={() => patch({ intentSubType: v })}>{v}</button>
            ))}
          </div>
        )}

        {intent === "gift" && (
          <div className="grid3">
            {["Birthday","Wedding","Festival"].map(v => (
              <button key={v} className={`chip ${intentSubType===v?"active":""}`} onClick={() => patch({ intentSubType: v })}>{v}</button>
            ))}
          </div>
        )}

        <div className="actions">
          <button className="btn ghost" onClick={() => nav("/")}>Back</button>
          <button className="btn" onClick={() => nav("/basic-profile")}>Continue</button>
        </div>
      </section>
    </PageShell>
  );
}
