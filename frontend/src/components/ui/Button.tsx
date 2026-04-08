import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  const styles =
    variant === "primary"
      ? "bg-[linear-gradient(135deg,var(--primary),#9b8bff)] text-white shadow-[var(--shadow-1)]"
      : "bg-white/5 text-[var(--text)] border border-white/15";
  return (
    <button
      {...props}
      className={`px-4 py-2.5 rounded-xl font-medium transition duration-200 hover:opacity-95 active:scale-[0.99] ${styles} ${className}`}
    />
  );
}
