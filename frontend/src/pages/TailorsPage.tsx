import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";

const tailors = [
  { id: "t1", name: "Urban Tailor Studio", rating: 4.8, eta: "3-5 days" },
  { id: "t2", name: "Luxe Stitch House", rating: 4.7, eta: "2-4 days" }
];

export default function TailorsPage() {
  const nav = useNavigate();

  return (
    <AppShell>
      <SectionHeader title="Expert Discovery" subtitle="Choose verified professionals aligned to your fit needs." />
      <div className="grid md:grid-cols-2 gap-5">
        {tailors.map((t) => (
          <Card key={t.id} className="p-5">
            <h3 className="text-lg font-semibold">{t.name}</h3>
            <p className="mt-2 text-[var(--muted)]">⭐ {t.rating} · ETA {t.eta}</p>
            <Button className="mt-5" onClick={() => nav("/booking")}>Book Consultation</Button>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
