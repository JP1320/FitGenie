import React from "react";

export function Toast({
  title,
  message,
  type = "success"
}: {
  title: string;
  message: string;
  type?: "success" | "error";
}) {
  const tone =
    type === "success"
      ? "border-emerald-400/40 bg-emerald-500/10"
      : "border-red-400/40 bg-red-500/10";

  return (
    <div className={`rounded-xl border px-4 py-3 ${tone}`}>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-[var(--muted)] mt-1">{message}</p>
    </div>
  );
}
