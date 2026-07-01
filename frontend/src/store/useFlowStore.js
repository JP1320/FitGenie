import { create } from "zustand";

const initialState = {
  userId: "guest_user",
  auth: {
    loginMode: "guest",
    token: "",
    isGuest: true,
  },
  intent: {
    type: "",
    subType: "",
  },
  profile: {
    ageRange: "",
    gender: "",
  },
  body: {
    bodyType: "",
    size: "",
    heightCm: "",
    heightRange: "",
    scanResult: null,
  },
  preferences: {
    style: "",
    budget: "",
    fabric: [],
    sleeve: "",
    length: "",
    fit: "",
  },
  recommendations: {
    list: [],
    selectedOutfit: null,
  },
  marketplace: {
    serviceType: "",
    ratingFilter: "",
    locationFilter: "",
    experts: [],
    selectedExpert: null,
  },
  delivery: {
    mode: "",
    schedule: "",
    chatEnabled: false,
  },
  fitCard: null,
  order: {
    bookingId: "",
    status: "Accepted",
    timeline: ["Accepted"],
  },
  feedback: {
    fitAccuracy: 0,
    service: 0,
    delivery: 0,
    photoUrl: "",
    comment: "",
  },
};

export const useFlowStore = create((set) => ({
  ...initialState,

  patch: (section, payload) =>
    set((state) => ({
      [section]: {
        ...state[section],
        ...payload,
      },
    })),

  setValue: (key, value) =>
    set(() => ({
      [key]: value,
    })),

  reset: () => set(initialState),
}));
