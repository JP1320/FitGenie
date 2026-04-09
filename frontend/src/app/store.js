import { create } from "zustand";

export const useFlowStore = create((set) => ({
  // core identity
  userId: "u_live_001",

  // optional sections (all skippable)
  onboarding: {
    name: "",
    email: "",
    phone: "",
    intent: "",
    forWhom: "",
    notes: ""
  },
  profile: {
    ageRange: "",
    gender: "",
    bodyType: "",
    heightCm: "",
    weightKg: "",
    manualSize: "",
    fitPreference: ""
  },
  preferences: {
    styles: [],
    occasions: [],
    fabrics: [],
    colors: [],
    budgetRange: "",
    regionWear: [],
    season: []
  },
  scan: {
    chest: "",
    waist: "",
    shoulder: "",
    inseam: "",
    confidence: null
  },

  // backend results
  recommendations: null,
  tailors: [],
  booking: null,

  // status
  completedSteps: [],
  skippedSteps: [],

  // setters
  setUserId: (userId) => set({ userId }),

  setOnboarding: (payload) =>
    set((s) => ({ onboarding: { ...s.onboarding, ...payload } })),

  setProfile: (payload) =>
    set((s) => ({ profile: { ...s.profile, ...payload } })),

  setPreferences: (payload) =>
    set((s) => ({ preferences: { ...s.preferences, ...payload } })),

  setScan: (payload) =>
    set((s) => ({ scan: { ...s.scan, ...payload } })),

  setRecommendations: (recommendations) => set({ recommendations }),
  setTailors: (tailors) => set({ tailors }),
  setBooking: (booking) => set({ booking }),

  markStepCompleted: (stepKey) =>
    set((s) => ({
      completedSteps: s.completedSteps.includes(stepKey)
        ? s.completedSteps
        : [...s.completedSteps, stepKey],
      skippedSteps: s.skippedSteps.filter((k) => k !== stepKey)
    })),

  markStepSkipped: (stepKey) =>
    set((s) => ({
      skippedSteps: s.skippedSteps.includes(stepKey)
        ? s.skippedSteps
        : [...s.skippedSteps, stepKey],
      completedSteps: s.completedSteps.filter((k) => k !== stepKey)
    })),

  resetFlow: () =>
    set({
      userId: "u_live_001",
      onboarding: {
        name: "",
        email: "",
        phone: "",
        intent: "",
        forWhom: "",
        notes: ""
      },
      profile: {
        ageRange: "",
        gender: "",
        bodyType: "",
        heightCm: "",
        weightKg: "",
        manualSize: "",
        fitPreference: ""
      },
      preferences: {
        styles: [],
        occasions: [],
        fabrics: [],
        colors: [],
        budgetRange: "",
        regionWear: [],
        season: []
      },
      scan: {
        chest: "",
        waist: "",
        shoulder: "",
        inseam: "",
        confidence: null
      },
      recommendations: null,
      tailors: [],
      booking: null,
      completedSteps: [],
      skippedSteps: []
    })
}));
