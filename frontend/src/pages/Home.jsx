import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <motion.section className="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={{ fontSize: 44, marginBottom: 8 }}>FitGenie Premium</h1>
      <p>Luxury fit journey with AI recommendations, tailor discovery, and booking.</p>
      <Link className="btn" to="/onboarding">Start Premium Journey</Link>
    </motion.section>
  );
}
