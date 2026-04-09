import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { callApi } from "../services/api";

export default function Onboarding() {
  const [userId, setUserId] = useState("u_live_001");
  const [name, setName] = useState("Ritesh");
  const [msg, setMsg] = useState("");
  const nav = useNavigate();

  const submit = async () => {
    const r = await callApi("/user/profile", "POST", { userId, name });
    if (r.ok) nav("/scan", { state: { userId } });
    else setMsg("Failed to save profile");
  };

  return (
    <section className="card">
      <h2>Step 1: Onboarding</h2>
      <input value={userId} onChange={(e)=>setUserId(e.target.value)} placeholder="User ID" />
      <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" />
      <button className="btn" onClick={submit}>Continue</button>
      {msg && <p>{msg}</p>}
    </section>
  );
}
