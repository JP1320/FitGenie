import React from "react";

export function ProgressStepper({
  steps,
  current
}: {
  steps: string[];
  current: number;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 shrink-0">
          <div
            className={`h-7 w-7 rounded-full flex items-center justify-center text-xs border ${
              i <= current
                ? "bg-[var(--primary)] border-[var(--primary)] text-white"
                : "bg-white/5 border-white/15 text-[var(--muted)]"
            }`}
          >
            {i + 1}
          </div>
          <span className={`text-xs ${i <= current ? "text-white" : "text-[var(--muted)]"}`}>{s}</span>
          {i < steps.length - 1 ? <div className="w-5 h-px bg-white/20" /> : null}
        </div>
      ))}
    </div>
  );
}
