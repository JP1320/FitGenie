import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { SectionHeader } from "../components/ui/SectionHeader";

export default function MeasurementsPage() {
  const nav = useNavigate();
  const [m, setM] = useState({ chest: 90, waist: 78, hip: 95, height: 172 });

  return (
    <AppShell>
      <SectionHeader title="AI Fit Scanner" subtitle="Enter your measurements for precision recommendations." />
      <Card className="p-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <Input type="number" value={m.chest} onChange={(e)=>setM({...m, chest:Number(e.target.value)})} placeholder="Chest (cm)" />
          <Input type="number" value={m.waist} onChange={(e)=>setM({...m, waist:Number(e.target.value)})} placeholder="Waist (cm)" />
          <Input type="number" value={m.hip} onChange={(e)=>setM({...m, hip:Number(e.target.value)})} placeholder="Hip (cm)" />
          <Input type="number" value={m.height} onChange={(e)=>setM({...m, height:Number(e.target.value)})} placeholder="Height (cm)" />
        </div>
        <div className="mt-5">
          <Button onClick={() => nav("/recommendations")}>Generate Recommendations</Button>
        </div>
      </Card>
    </AppShell>
  );
}
