import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import StepShell from "../components/StepShell";
import { useFlowStore } from "../store/useFlowStore";

export default function Welcome() {
  const nav = useNavigate();
  const { patch } = useFlowStore();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <motion.main
          key="splash"
          className="splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6 }}
        >
          <div className="splash-card">
            <h1 className="splash-title">FitGenie</h1>
            <p className="splash-sub">Find your perfect fit in seconds</p>
          </div>
        </motion.main>
      ) : (
        <StepShell
          key="login"
          step={1}
          title="Welcome to FitGenie"
          className="bg-login"
        >
          <div className="stack">
            <button
              className="btn"
              onClick={() => {
                patch({ loginMode: "google" });
                nav("/login/email");
              }}
            >
              Continue with Google
            </button>
            <button
              className="btn"
              onClick={() => {
                patch({ loginMode: "mobile" });
                nav("/login/mobile");
              }}
            >
              Continue with Mobile Number
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                patch({ loginMode: "guest" });
                nav("/intent");
              }}
            >
              Continue as Guest
            </button>
          </div>
        </StepShell>
      )}
    </AnimatePresence>
  );
}
