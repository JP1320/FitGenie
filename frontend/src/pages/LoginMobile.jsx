import React from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";

export default function LoginMobile() {
  const nav = useNavigate();

  return (
    <StepShell step={1} title="Login with Mobile" className="bg-auth">
      <label>Mobile Number</label>
      <input placeholder="+91 9XXXXXXXXX" />
      <label>OTP (mock)</label>
      <input placeholder="123456" />
      <div className="row">
        <button className="btn" onClick={() => nav("/intent")}>
          Verify & Continue
        </button>
        <button className="btn ghost" onClick={() => nav("/welcome")}>
          Back
        </button>
      </div>
    </StepShell>
  );
}
