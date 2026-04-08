import React from "react";

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
      {subtitle ? <p className="mt-2 text-[var(--muted)]">{subtitle}</p> : null}
    </div>
  );
}
