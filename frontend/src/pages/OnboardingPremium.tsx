import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export default function OnboardingPage() {
  const nav = useNavigate();

  return (
    <AppShell>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-8">
          <p className="text-sm text-[var(--primary-2)]">Personalized. Precise. Premium.</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight">Design Your Perfect Fit Journey</h1>
          <p className="mt-4 text-[var(--muted)]">
            Create your profile, discover AI-curated looks, and book trusted tailoring experts.
          </p>
          <div className="mt-8 flex gap-3">
            <Button onClick={() => nav("/profile")}>Get Started</Button>
            <Button variant="ghost" onClick={() => nav("/recommendations")}>Explore Demo</Button>
          </div>
        </Card>
        <Card className="p-0 overflow-hidden">
          <div className="h-full min-h-[320px] bg-[linear-gradient(135deg,#2a355f,#151c2f)] flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-[var(--muted)]">AI Fit Scanner</p>
              <p className="text-3xl font-semibold mt-2">Confidence-led Styling</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
