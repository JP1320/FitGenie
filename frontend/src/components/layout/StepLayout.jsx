import React from "react";
import { motion } from "framer-motion";

export default function StepLayout({
  title,
  subtitle,
  step = 1,
  total = 8,
  children,
  actions
}) {
  const pct = Math.round((step / total) * 100);

  return (
    <motion.section
      className="card"
      initial={{ opacity: 0, y: 14, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
    >
      <h2>{title}</h2>
      <p>{subtitle}</p>
      <div className="stepbar"><div style={{ width: `${pct}%` }} /></div>
      {children}
      <div className="row" style={{ marginTop: 10 }}>{actions}</div>
    </motion.section>
  );
}
