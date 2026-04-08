import React from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export default function OnboardingPremium() {
  const nav = useNavigate();
  return (
    <AppShell>
      <section className="grid md:grid-cols-2 gap-6 items-stretch">
        <Card className="p-8">
          <p className="text-sm text-[var(--primary-2)]">Personalized. Precise. Premium.</p>
          <h1 className="mt-2 text-4xl font-semibold leading-tight">Your AI-Powered Fit Experience</h1>
          <p className="mt-4 text-[var(--muted)]">
            Build your profile, get tailored outfit recommendations, and book expert designers seamlessly.
          </p>
          <Button className="mt-6 text-white" onClick={() => nav("/profile")}>
            Start Your Style Journey
          </Button>
        </Card>
        <Card className="p-8 flex items-center justify-center">
          <div className="w-full h-72 rounded-2xl bg-[linear-gradient(135deg,#2a355f,#171f35)] border border-white/10" />
        </Card>
      </section>
    </AppShell>
  );
}
