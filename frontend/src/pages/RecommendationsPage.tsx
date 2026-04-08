import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";

const recos = [
  { id: "r1", title: "Smart Casual Ensemble", reason: "Matches your body proportions and style preference.", fit: 92 },
  { id: "r2", title: "Minimal Formal Set", reason: "Great for events with high comfort and structure balance.", fit: 88 }
];

export default function RecommendationsPage() {
  const nav = useNavigate();

  return (
    <AppShell>
      <SectionHeader title="AI Recommendations" subtitle="Curated looks with fit confidence and rationale." />
      <div className="grid md:grid-cols-2 gap-5">
        {recos.map((r) => (
          <Card key={r.id} className="p-5">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{r.title}</h3>
              <span className="text-sm px-2 py-1 rounded-lg bg-white/10">{r.fit}% fit</span>
            </div>
            <p className="text-[var(--muted)] mt-3">{r.reason}</p>
            <Button className="mt-5" onClick={() => nav("/tailors")}>Select & Find Expert</Button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
