import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StepLayout from "../components/layout/StepLayout";
import { useFlowStore } from "../app/store";
import { callApi } from "../services/api";

export default function Booking() {
  const nav = useNavigate();
  const { userId, setBooking, markStepCompleted } = useFlowStore();
  const [slot, setSlot] = useState("2026-04-10T11:00:00Z");

  async function confirm() {
    const r = await callApi("/booking", "POST", {
      userId,
      tailorId: "t1",
      slot
    });
    if (r.ok) {
      setBooking(r.data);
      markStepCompleted("booking");
      nav("/success");
    }
  }

  return (
    <StepLayout
      step={6}
      total={8}
      title="Step 6 · Booking"
      subtitle="Confirm your tailor slot."
      actions={<button className="btn" onClick={confirm}>Confirm Booking</button>}
    >
      <label>Slot (ISO)</label>
      <input value={slot} onChange={(e) => setSlot(e.target.value)} />
    </StepLayout>
  );
}
