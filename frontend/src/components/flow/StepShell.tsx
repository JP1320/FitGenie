"use client";
import { motion } from "framer-motion";
import ProgressBar from "./ProgressBar";

export default function StepShell({
  step, title, children
}: { step:number; title:string; children:React.ReactNode }) {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <div className="max-w-5xl mx-auto">
        <ProgressBar step={step} total={12} />
        <motion.section
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.28 }}
          className="mt-4 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl p-6 md:p-10"
        >
          <h1 className="text-2xl md:text-4xl font-semibold text-white">{title}</h1>
          <div className="mt-6">{children}</div>
        </motion.section>
      </div>
    </main>
  );
}
