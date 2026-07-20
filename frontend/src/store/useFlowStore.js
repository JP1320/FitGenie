import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  userId: "u_live_001",

  loginMode: "guest",
  authUser: null,
  authToken: "",

  intent: "",
  intentSubType: "",
  forWhom: "",
  relation: "",
  occasion: "",

  ageRange: "",
  age: "",
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
    length: "",
  },

  recommendations: null,
  selectedOutfit: null,
  confidenceScore: null,

  serviceType: "",
  marketplace: {},

  ratingFilter: "",
  locationFilter: "",
  selectedExpert: null,

  deliveryMode: "",
  schedule: "",
  deliverySchedule: "",
  delivery: {},

  fitCard: null,
  order: null,
  trackingStatus: "Accepted",

  feedback: {
    fit: 0,
    service: 0,
    delivery: 0,
    image: "",
  },
};

export const useFlowStore = create(
  persist(
    (set) => ({
      ...initialState,

      patch: (keyOrPayload, maybePayload) =>
        set((state) => {
          if (
            typeof keyOrPayload === "string" &&
            maybePayload &&
            typeof maybePayload === "object" &&
            !Array.isArray(maybePayload)
          ) {
            return {
              ...state,
              [keyOrPayload]: {
                ...(state[keyOrPayload] || {}),
                ...maybePayload,
              },
            };
          }

          if (
            keyOrPayload &&
            typeof keyOrPayload === "object" &&
            !Array.isArray(keyOrPayload)
          ) {
            return {
              ...state,
              ...keyOrPayload,
            };
          }

          return state;
        }),

      patchFilters: (payload) =>
        set((state) => ({
          filters: {
            ...state.filters,
            ...payload,
          },
        })),

      setAuth: ({ loginMode, authUser, authToken }) =>
        set((state) => ({
          ...state,
          loginMode: loginMode || state.loginMode || "guest",
          authUser: authUser || null,
          authToken: authToken || "",
        })),

      resetAuth: () =>
        set((state) => ({
          ...state,
          loginMode: "guest",
          authUser: null,
          authToken: "",
        })),

      resetFlow: () =>
        set((state) => ({
          ...initialState,
          loginMode: state.loginMode,
          authUser: state.authUser,
          authToken: state.authToken,
        })),
    }),
    {
      name: "fitgenie-flow-store",
      partialize: (state) => {
        const {
          patch,
          patchFilters,
          setAuth,
          resetAuth,
          resetFlow,
          ...persistedState
        } = state;

        return persistedState;
      },
    }
  )
);
