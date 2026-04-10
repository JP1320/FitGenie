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

  style: "",
  budget: "",
  fabric: [],
  fitDetails: { sleeve: "", length: "", fit: "" },

  recommendations: null,

  serviceType: "",
  ratingFilter: "",
  locationFilter: "",

  selectedExpert: null,

  deliveryMode: "",
  schedule: "",
  chatEnabled: false,

  fitCard: null,
  trackingStatus: "Accepted",
  feedback: { fit: 0, service: 0, delivery: 0, photoUrl: "" },

  patch: (payload) => set((s) => ({ ...s, ...payload })),
  reset: () =>
    set({
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
      style: "",
      budget: "",
      fabric: [],
      fitDetails: { sleeve: "", length: "", fit: "" },
      recommendations: null,
      serviceType: "",
      ratingFilter: "",
      locationFilter: "",
      selectedExpert: null,
      deliveryMode: "",
      schedule: "",
      chatEnabled: false,
      fitCard: null,
      trackingStatus: "Accepted",
      feedback: { fit: 0, service: 0, delivery: 0, photoUrl: "" }
    })
}));
