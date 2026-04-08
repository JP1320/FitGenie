import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";

const steps = ["Accepted", "In Progress", "Stitching", "Ready", "Shipped"];

export default function TrackingPage() {
  const nav = useNavigate();

  return (
    <AppShell>
      <SectionHeader title="Order Tracking" subtitle="Follow your tailoring progress in real time." />
      <Card className="p-6 max-w-2xl">
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${i <= 1 ? "bg-[var(--primary-2)]" : "bg-white/20"}`} />
              <span className={i <= 1 ? "font-medium" : "text-[var(--muted)]"}>{s}</span>
            </li>
          ))}
        </ol>
        <Button className="mt-6" onClick={() => nav("/feedback")}>Leave Feedback</Button>
      </Card>
    </AppShell>
  );
}
