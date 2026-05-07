import React from "react";
import { useNavigate } from "react-router-dom";
import StepShell from "../components/StepShell";

export default function LoginEmail() {
  const nav = useNavigate();

  return (
    <StepShell step={1} title="Login with Email" className="bg-auth">
      <label>Email</label>
      <input placeholder="you@example.com" />
      <label>Password</label>
      <input type="password" placeholder="••••••••" />
      <div className="row">
        <button className="btn" onClick={() => nav("/intent")}>
          Sign In
        </button>
        <button className="btn ghost" onClick={() => nav("/welcome")}>
          Back
        </button>
      </div>
    </StepShell>
  );
}
