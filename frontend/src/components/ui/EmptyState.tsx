import React from "react";
import { Button } from "./Button";

export function EmptyState({
  title,
  subtitle,
  ctaLabel,
  onCta
}: {
  title: string;
  subtitle: string;
  ctaLabel?: string;
  onCta?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-sm text-[var(--muted)] mt-2">{subtitle}</p>
      {ctaLabel && onCta ? (
        <Button className="mt-5" onClick={onCta}>
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );
}
