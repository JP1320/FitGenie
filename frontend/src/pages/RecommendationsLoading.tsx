import React from "react";
import AppShell from "../components/layout/AppShell";
import { SectionHeader } from "../components/ui/SectionHeader";
import { Skeleton } from "../components/ui/Skeleton";

export default function RecommendationsLoading() {
  return (
    <AppShell>
      <SectionHeader title="AI Recommendations" subtitle="Preparing your personalized fits..." />
      <div className="grid md:grid-cols-2 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full mt-3" />
            <Skeleton className="h-4 w-5/6 mt-2" />
            <Skeleton className="h-10 w-36 mt-5" />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
