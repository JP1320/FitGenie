"use client";
import { create } from "zustand";

type FitState = {
  step: number;
  user: { mode: "google"|"mobile"|"guest"; email?: string; phone?: string };
  intent: { type?: string; subtype?: string };
  profile: { age?: string; gender?: string };
  body: { bodyType?: string; size?: string; heightCm?: string; heightRange?: string };
  scan: { photo?: string; height?: string; proportions?: string; recommendedSize?: string; fitType?: string };
  filters: { style?: string; budget?: string; fabric?: string; fit?: string; sleeve?: string; length?: string };
  product?: any;
  service: { type?: string; rating?: string; location?: string };
  expert?: any;
  delivery: { mode?: string; schedule?: string };
  tracking: string;
  feedback: { fit?: number; service?: number; delivery?: number; image?: string };
  set: (patch: Partial<FitState>) => void;
};

export const useFitStore = create<FitState>((set) => ({
  step: 1,
  user: { mode: "guest" },
  intent: {},
  profile: {},
  body: {},
  scan: {},
  filters: {},
  service: {},
  delivery: {},
  tracking: "Accepted",
  feedback: {},
  set: (patch) => set((s) => ({ ...s, ...patch })),
}));
