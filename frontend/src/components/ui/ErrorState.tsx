import React from "react";
import { Button } from "./Button";

export function ErrorState({
  title = "Something went wrong",
  subtitle = "Please try again.",
  onRetry
}: {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-6">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
