import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="card hero">
      <h1>Premium Fit. Zero Guesswork.</h1>
      <p>AI-powered sizing, recommendations, tailor discovery, and booking in one smooth flow.</p>
      <Link to="/onboarding" className="btn">Start Your Fit Journey</Link>
    </section>
  );
}
