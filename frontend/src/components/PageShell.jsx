import React from "react";
import { motion } from "framer-motion";

export default function PageShell({ className = "", children }) {
  return (
    <motion.main
      className={`page ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.main>
  );
}
