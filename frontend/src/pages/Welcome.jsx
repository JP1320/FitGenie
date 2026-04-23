import React from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";
import { useFlowStore } from "../store/useFlowStore";

export default function Welcome() {
  const nav = useNavigate();
  const { patch } = useFlowStore();

  return (
    <StepShell step={1} title="Find your perfect fit in seconds" className="bg-welcome">
      <div className="grid3">
        <button className="btn" onClick={() => { patch({ loginMode: "google" }); nav("/intent"); }}>Continue with Google</button>
        <button className="btn" onClick={() => { patch({ loginMode: "mobile" }); nav("/intent"); }}>Continue with Mobile</button>
        <button className="btn ghost" onClick={() => { patch({ loginMode: "guest" }); nav("/intent"); }}>Continue as Guest</button>
      </div>
    </StepShell>
  );
}
