import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";

export default function FitCardPage() {
  const nav = useNavigate();

  return (
    <AppShell>
      <SectionHeader title="Fit Card" subtitle="Your structured fit profile for seamless tailoring." />
      <Card className="p-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="text-[var(--muted)]">Chest</div><div>90 cm</div>
          <div className="text-[var(--muted)]">Waist</div><div>78 cm</div>
          <div className="text-[var(--muted)]">Hip</div><div>95 cm</div>
          <div className="text-[var(--muted)]">Height</div><div>172 cm</div>
        </div>
        <p className="mt-5 text-[var(--muted)]">AI Summary: Balanced silhouette with smart-casual preference confidence.</p>
        <Button className="mt-6" onClick={() => nav("/tracking")}>Track Order</Button>
      </Card>
    </AppShell>
  );
}
