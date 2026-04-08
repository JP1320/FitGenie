import React from "react";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-[var(--text)] bg-[radial-gradient(circle_at_top,#1b2440_0%,#0b0f19_45%)]">
      <header className="sticky top-0 z-20 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-semibold tracking-wide">FitGenie</div>
          <div className="text-sm text-[var(--muted)]">AI Fashion Concierge</div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
