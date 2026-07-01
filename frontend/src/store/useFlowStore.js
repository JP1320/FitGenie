import { create } from "zustand";

const initialState = {
  userId: "guest_user",

  // ---------------------------------------------------------------------------
  // New grouped structure
  // ---------------------------------------------------------------------------
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
    confidenceScore: null,
    generatedAt: "",
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

  // ---------------------------------------------------------------------------
  // Backward-compatible old top-level fields
  // Keep these because existing pages still use them.
  // ---------------------------------------------------------------------------
  loginMode: "guest",

  forWhom: "",
  relation: "",
  occasion: "",

  age: "",
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
  fitDetails: {
    sleeve: "",
    length: "",
    fit: "",
  },

  serviceType: "",
  ratingFilter: "",
  locationFilter: "",
  selectedExpert: null,

  deliveryMode: "",
  deliverySchedule: "",
  chatEnabled: false,
};

function syncLegacyToGrouped(state, payload) {
  const next = { ...payload };

  if (Object.prototype.hasOwnProperty.call(payload, "loginMode")) {
    next.auth = {
      ...state.auth,
      loginMode: payload.loginMode,
      isGuest: payload.loginMode === "guest",
    };
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "forWhom") ||
    Object.prototype.hasOwnProperty.call(payload, "relation") ||
    Object.prototype.hasOwnProperty.call(payload, "occasion")
  ) {
    next.intent = {
      ...state.intent,
      type: payload.forWhom ?? state.intent.type,
      subType:
        payload.relation ??
        payload.occasion ??
        state.intent.subType,
    };
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "age") ||
    Object.prototype.hasOwnProperty.call(payload, "ageRange") ||
    Object.prototype.hasOwnProperty.call(payload, "gender")
  ) {
    next.profile = {
      ...state.profile,
      ageRange:
        payload.ageRange ??
        payload.age ??
        state.profile.ageRange,
      gender: payload.gender ?? state.profile.gender,
    };
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "bodyType") ||
    Object.prototype.hasOwnProperty.call(payload, "size") ||
    Object.prototype.hasOwnProperty.call(payload, "heightCm") ||
    Object.prototype.hasOwnProperty.call(payload, "heightRange") ||
    Object.prototype.hasOwnProperty.call(payload, "scanResult")
  ) {
    next.body = {
      ...state.body,
      bodyType: payload.bodyType ?? state.body.bodyType,
      size: payload.size ?? state.body.size,
      heightCm: payload.heightCm ?? state.body.heightCm,
      heightRange: payload.heightRange ?? state.body.heightRange,
      scanResult: payload.scanResult ?? state.body.scanResult,
    };
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "style") ||
    Object.prototype.hasOwnProperty.call(payload, "budget") ||
    Object.prototype.hasOwnProperty.call(payload, "fabric") ||
    Object.prototype.hasOwnProperty.call(payload, "fitDetails")
  ) {
    next.preferences = {
      ...state.preferences,
      style: payload.style ?? state.preferences.style,
      budget: payload.budget ?? state.preferences.budget,
      fabric: payload.fabric ?? state.preferences.fabric,
      sleeve:
        payload.fitDetails?.sleeve ??
        state.preferences.sleeve,
      length:
        payload.fitDetails?.length ??
        state.preferences.length,
      fit:
        payload.fitDetails?.fit ??
        state.preferences.fit,
    };
  }

  if (Object.prototype.hasOwnProperty.call(payload, "serviceType")) {
    next.marketplace = {
      ...state.marketplace,
      serviceType: payload.serviceType,
    };
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "ratingFilter") ||
    Object.prototype.hasOwnProperty.call(payload, "locationFilter") ||
    Object.prototype.hasOwnProperty.call(payload, "selectedExpert")
  ) {
    next.marketplace = {
      ...state.marketplace,
      ...(next.marketplace || {}),
      ratingFilter:
        payload.ratingFilter ?? state.marketplace.ratingFilter,
      locationFilter:
        payload.locationFilter ?? state.marketplace.locationFilter,
      selectedExpert:
        payload.selectedExpert ?? state.marketplace.selectedExpert,
    };
  }

  if (
    Object.prototype.hasOwnProperty.call(payload, "deliveryMode") ||
    Object.prototype.hasOwnProperty.call(payload, "deliverySchedule") ||
    Object.prototype.hasOwnProperty.call(payload, "chatEnabled")
  ) {
    next.delivery = {
      ...state.delivery,
      mode: payload.deliveryMode ?? state.delivery.mode,
      schedule:
        payload.deliverySchedule ?? state.delivery.schedule,
      chatEnabled:
        payload.chatEnabled ?? state.delivery.chatEnabled,
    };
  }

  return next;
}

function syncGroupedToLegacy(state, section, payload) {
  if (section === "auth") {
    return {
      auth: {
        ...state.auth,
        ...payload,
      },
      loginMode:
        payload.loginMode ??
        state.auth.loginMode ??
        state.loginMode,
    };
  }

  if (section === "intent") {
    return {
      intent: {
        ...state.intent,
        ...payload,
      },
      forWhom:
        payload.type ??
        state.intent.type ??
        state.forWhom,
      relation:
        payload.subType ??
        state.intent.subType ??
        state.relation,
      occasion:
        payload.subType ??
        state.intent.subType ??
        state.occasion,
    };
  }

  if (section === "profile") {
    return {
      profile: {
        ...state.profile,
        ...payload,
      },
      ageRange:
        payload.ageRange ??
        state.profile.ageRange ??
        state.ageRange,
      age:
        payload.ageRange ??
        state.profile.ageRange ??
        state.age,
      gender:
        payload.gender ??
        state.profile.gender ??
        state.gender,
    };
  }

  if (section === "body") {
    return {
      body: {
        ...state.body,
        ...payload,
      },
      bodyType:
        payload.bodyType ??
        state.body.bodyType ??
        state.bodyType,
      size:
        payload.size ??
        state.body.size ??
        state.size,
      heightCm:
        payload.heightCm ??
        state.body.heightCm ??
        state.heightCm,
      heightRange:
        payload.heightRange ??
        state.body.heightRange ??
        state.heightRange,
      scanResult:
        payload.scanResult ??
        state.body.scanResult ??
        state.scanResult,
    };
  }

  if (section === "preferences") {
    const mergedPreferences = {
      ...state.preferences,
      ...payload,
    };

    return {
      preferences: mergedPreferences,
      style: mergedPreferences.style,
      budget: mergedPreferences.budget,
      fabric: mergedPreferences.fabric || [],
      fitDetails: {
        sleeve: mergedPreferences.sleeve || "",
        length: mergedPreferences.length || "",
        fit: mergedPreferences.fit || "",
      },
    };
  }

  if (section === "recommendations") {
    return {
      recommendations: {
        ...state.recommendations,
        ...payload,
      },
    };
  }

  if (section === "marketplace") {
    const mergedMarketplace = {
      ...state.marketplace,
      ...payload,
    };

    return {
      marketplace: mergedMarketplace,
      serviceType: mergedMarketplace.serviceType,
      ratingFilter: mergedMarketplace.ratingFilter,
      locationFilter: mergedMarketplace.locationFilter,
      selectedExpert: mergedMarketplace.selectedExpert,
    };
  }

  if (section === "delivery") {
    const mergedDelivery = {
      ...state.delivery,
      ...payload,
    };

    return {
      delivery: mergedDelivery,
      deliveryMode: mergedDelivery.mode,
      deliverySchedule: mergedDelivery.schedule,
      chatEnabled: mergedDelivery.chatEnabled,
    };
  }

  return {
    [section]: {
      ...(state[section] || {}),
      ...payload,
    },
  };
}

export const useFlowStore = create((set) => ({
  ...initialState,

  patch: (sectionOrPayload, payload) =>
    set((state) => {
      // New style:
      // patch("profile", { gender: "Female" })
      if (typeof sectionOrPayload === "string") {
        return syncGroupedToLegacy(
          state,
          sectionOrPayload,
          payload || {}
        );
      }

      // Old style:
      // patch({ gender: "Female" })
      if (
        typeof sectionOrPayload === "object" &&
        sectionOrPayload !== null
      ) {
        return syncLegacyToGrouped(state, sectionOrPayload);
      }

      return {};
    }),

  setValue: (key, value) =>
    set(() => ({
      [key]: value,
    })),

  reset: () => set(initialState),
}));
