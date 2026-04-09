import React from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "../components/layout/StepLayout";
import { useFlowStore } from "../app/store";
import { callApi } from "../services/api";

export default function Onboarding() {
  const nav = useNavigate();
  const { userId, setUserId, onboarding, setOnboarding, markStepCompleted, markStepSkipped } = useFlowStore();

  async function saveAndContinue() {
    await callApi("/user/profile", "POST", {
      userId,
      name: onboarding.name || "Guest User"
    });
    markStepCompleted("onboarding");
    nav("/preferences");
  }

  function skip() {
    markStepSkipped("onboarding");
    nav("/preferences");
  }

  return (
    <StepLayout
      step={1}
      total={8}
      title="Step 1 · Onboarding"
      subtitle="All fields are optional. You can skip this section."
      actions={
        <>
          <button className="btn" onClick={saveAndContinue}>Save & Continue</button>
          <button className="btn ghost" onClick={skip}>Skip for now</button>
        </>
      }
    >
      <label>User ID</label>
      <input value={userId} onChange={(e) => setUserId(e.target.value)} />

      <label>Name (optional)</label>
      <input value={onboarding.name} onChange={(e) => setOnboarding({ name: e.target.value })} />

      <label>Email (optional)</label>
      <input value={onboarding.email} onChange={(e) => setOnboarding({ email: e.target.value })} />
    </StepLayout>
  );
}
