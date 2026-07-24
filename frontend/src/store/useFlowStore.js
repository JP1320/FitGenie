import { create } from "zustand";
import { persist } from "zustand/middleware";

const initialState = {
  loginMode: "",
  authUser: null,
  authToken: "",

  intent: "",
  basicProfile: {},
  sizeBody: {},
  scanner: {},
  guidedFilters: {},
  recommendations: [],
  serviceType: {},
  qualityLocation: {},
  selectedExpert: null,
  delivery: {},
  fitCard: {},
  tracking: {},
  feedback: {},
};

export const useFlowStore = create(
  persist(
    (set, get) => ({
      ...initialState,

      patch(keyOrPayload, maybePayload) {
        if (
          typeof keyOrPayload === "string" &&
          maybePayload !== undefined &&
          maybePayload !== null &&
          typeof maybePayload === "object" &&
          !Array.isArray(maybePayload)
        ) {
          set((state) => ({
            [keyOrPayload]: {
              ...(state[keyOrPayload] || {}),
              ...maybePayload,
            },
          }));

          return;
        }

        if (typeof keyOrPayload === "string") {
          set({
            [keyOrPayload]: maybePayload,
          });

          return;
        }

        if (
          keyOrPayload &&
          typeof keyOrPayload === "object" &&
          !Array.isArray(keyOrPayload)
        ) {
          set({
            ...keyOrPayload,
          });
        }
      },

      patchFilters(payload) {
        set((state) => ({
          guidedFilters: {
            ...(state.guidedFilters || {}),
            ...(payload || {}),
          },
        }));
      },

      setAuth({ loginMode, authUser, authToken }) {
        set({
          loginMode: loginMode || "",
          authUser: authUser || null,
          authToken: authToken || "",
        });
      },

      resetAuth() {
        set({
          loginMode: "",
          authUser: null,
          authToken: "",
        });
      },

      resetFlow() {
        const current = get();

        set({
          ...initialState,
          loginMode: current.loginMode || "",
          authUser: current.authUser || null,
          authToken: current.authToken || "",
        });
      },

      clearEverything() {
        set({
          ...initialState,
        });
      },
    }),
    {
      name: "fitgenie-flow-store",
      version: 3,
      partialize: (state) => {
        const output = {};

        Object.entries(state).forEach(([key, value]) => {
          if (typeof value !== "function") {
            output[key] = value;
          }
        });

        return output;
      },
    }
  )
);
