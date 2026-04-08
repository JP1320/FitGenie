import React, { useState } from "react";
import AppShell from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";

export default function FeedbackPage() {
  const [fit, setFit] = useState(5);
  const [service, setService] = useState(5);
  const [delivery, setDelivery] = useState(5);

  return (
    <AppShell>
      <SectionHeader title="Feedback Loop" subtitle="Help us refine your next experience." />
      <Card className="p-6 max-w-2xl">
        <div className="grid gap-4">
          <Input type="number" min={1} max={5} value={fit} onChange={(e)=>setFit(Number(e.target.value))} placeholder="Fit Accuracy (1-5)" />
          <Input type="number" min={1} max={5} value={service} onChange={(e)=>setService(Number(e.target.value))} placeholder="Service (1-5)" />
          <Input type="number" min={1} max={5} value={delivery} onChange={(e)=>setDelivery(Number(e.target.value))} placeholder="Delivery (1-5)" />
          <Input placeholder="Optional comments" />
          <Button>Submit Feedback</Button>
        </div>
      </Card>
    </AppShell>
  );
}
