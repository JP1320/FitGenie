import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import BottomNavMobile from "../components/layout/BottomNavMobile";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";
import { ProgressStepper } from "../components/ui/ProgressStepper";
import { Toast } from "../components/ui/Toast";

export default function ProfilePage() {
  const nav = useNavigate();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: "",
    location: "",
    style: "casual",
    budgetMin: 30,
    budgetMax: 120
  });

  const onContinue = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      nav("/measurements");
    }, 500);
  };

  return (
    <AppShell>
      <div className="container-premium fade-up">
        <ProgressStepper
          steps={["Profile", "Measurements", "Recommendations", "Booking"]}
          current={0}
        />

        <div className="mt-4">
          <SectionHeader
            title="Profile Input"
            subtitle="Tell us about your style, location, and budget."
          />
        </div>

        <Card className="card-pad max-w-2xl">
          <div className="grid gap-4">
            <Input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <Input
              placeholder="Style Preference (e.g. casual, formal)"
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Budget Min"
                value={form.budgetMin}
                onChange={(e) =>
                  setForm({ ...form, budgetMin: Number(e.target.value) })
                }
              />
              <Input
                type="number"
                placeholder="Budget Max"
                value={form.budgetMax}
                onChange={(e) =>
                  setForm({ ...form, budgetMax: Number(e.target.value) })
                }
              />
            </div>

            <div className="pt-2">
              <Button className="touch-target w-full sm:w-auto" onClick={onContinue}>
                Continue to Measurements
              </Button>
            </div>
          </div>
        </Card>

        {saved ? (
          <div className="mt-4 max-w-2xl">
            <Toast title="Saved" message="Profile captured successfully." type="success" />
          </div>
        ) : null}
      </div>

      <BottomNavMobile />
    </AppShell>
  );
}
