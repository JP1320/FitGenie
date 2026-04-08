import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-[var(--text)] placeholder:text-[var(--muted)]
      focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${props.className || ""}`}
    />
  );
}
