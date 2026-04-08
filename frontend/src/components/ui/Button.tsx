import React from "react";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2.5 rounded-xl font-medium transition ${props.className || ""}
      bg-[linear-gradient(135deg,var(--primary),#9b8bff)] hover:opacity-95
      shadow-[var(--shadow-1)] active:scale-[0.99]`}
    />
  );
}
