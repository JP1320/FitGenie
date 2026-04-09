import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Scan from "./pages/Scan.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Tailors from "./pages/Tailors.jsx";
import Booking from "./pages/Booking.jsx";
import Success from "./pages/Success.jsx";

function Stepper() {
  const location = useLocation();
  const steps = ["/onboarding", "/scan", "/recommendations", "/tailors", "/booking", "/success"];
  const idx = steps.indexOf(location.pathname);
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <div key={s} className={`step ${i <= idx ? "active" : ""}`}>{i + 1}</div>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <header className="nav">
        <Link to="/" className="brand">FitGenie</Link>
        <Link to="/onboarding" className="btn ghost">Start</Link>
      </header>

      <Stepper />

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/tailors" element={<Tailors />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </main>
    </div>
  );
}
