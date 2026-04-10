import React from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../components/PageShell";
import { useFlowStore } from "../store/useFlowStore";

export default function WelcomePage() {
  const nav = useNavigate();
  const { patch } = useFlowStore();

  return (
    <PageShell className="bg-hero">
      <section className="card xl">
        <h1>Find your perfect fit in seconds</h1>
        <p>AI styling + fit intelligence + expert tailoring workflow.</p>
        <div className="grid3">
          <button className="btn" onClick={() => { patch({ loginMode: "google" }); nav("/intent"); }}>Continue with Google</button>
          <button className="btn" onClick={() => { patch({ loginMode: "apple" }); nav("/intent"); }}>Continue with Apple</button>
          <button className="btn" onClick={() => { patch({ loginMode: "phone" }); nav("/intent"); }}>Continue with Phone</button>
        </div>
        <button className="btn ghost" onClick={() => { patch({ loginMode: "guest" }); nav("/intent"); }}>Continue as Guest</button>
      </section>
    </PageShell>
  );
}
