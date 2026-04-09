import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Preferences from "./pages/Preferences";
import Scan from "./pages/Scan";
import Recommendations from "./pages/Recommendations";
import Tailors from "./pages/Tailors";
import Booking from "./pages/Booking";
import Success from "./pages/Success";

export default function App() {
  return (
    <>
      <header className="nav">
        <Link className="brand" to="/">FitGenie</Link>
        <Link className="btn ghost" to="/onboarding">Start</Link>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/preferences" element={<Preferences />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/tailors" element={<Tailors />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/success" element={<Success />} />
        </Routes>
      </main>
    </>
  );
}
