import { create } from "zustand";

export const useFlowStore = create((set) => ({
  userId: "u_live_001",
  loginMode: "guest",

  intent: "",
  intentSubType: "",
  ageRange: "",
  gender: "",

  bodyType: "",
  size: "",
  heightCm: "",
  heightRange: "",

  scanResult: null,
  selectedProduct: null,

  filters: {
    style: "",
    budget: "",
    fabric: "",
    fit: "",
    sleeve: "",
    length: ""
  },

  recommendations: null,
  serviceType: "",
  ratingFilter: "",
  locationFilter: "",
  selectedExpert: null,

  deliveryMode: "",
  schedule: "",

  fitCard: null,
  trackingStatus: "Accepted",
  feedback: { fit: 0, service: 0, delivery: 0, image: "" },

  patch: (payload) => set((s) => ({ ...s, ...payload })),
  patchFilters: (payload) =>
    set((s) => ({ filters: { ...s.filters, ...payload } }))
}));
