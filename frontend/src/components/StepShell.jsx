import React from "react";
import { motion } from "framer-motion";

export default function StepShell({ step, title, className = "", children }) {
  return (
    <motion.main
      className={`page ${className}`}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <section className="card">
        <div className="step">Step {step} of 12</div>
        <h1>{title}</h1>
        {children}
      </section>
    </motion.main>
  );
}
