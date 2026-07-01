import express from "express";
import pino from "pino";
import cors from "cors";

const app = express();
const logger = pino();

const allowedOrigin =
  process.env.CORS_ORIGIN || "https://fit-genie-two.vercel.app";

app.use(
  cors({
    origin: allowedOrigin,
  })
);

app.use(express.json());

const otpRequests = new Map();

const health = {
  status: "ok",
  service: "fitgenie-backend",
};

const OUTFIT_CATALOG = [
  {
    outfitId: "outfit_casual_001",
    title: "Classic Cotton Casual Shirt",
    style: "Casual",
    fabric: "Cotton",
    fitType: "Regular",
    priceRange: "₹1,000 - ₹2,000",
    budgetBand: "₹1,000-₹2,000",
    imageUrl:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=1200&auto=format&fit=crop",
    baseReason:
      "A breathable cotton shirt with a regular fit gives everyday comfort and works well for casual styling.",
  },
  {
    outfitId: "outfit_ethnic_001",
    title: "Elegant Ethnic Kurta Set",
    style: "Ethnic",
    fabric: "Linen",
    fitType: "Regular",
    priceRange: "₹2,000 - ₹5,000",
    budgetBand: "₹2,000-₹5,000",
    imageUrl:
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?q=80&w=1200&auto=format&fit=crop",
    baseReason:
      "A comfortable ethnic kurta set is suitable for festivals, family events, and occasion-based dressing.",
  },
  {
    outfitId: "outfit_western_001",
    title: "Smart Western Co-ord Set",
    style: "Western",
    fabric: "Polyester / Blends",
    fitType: "Slim",
    priceRange: "₹2,000 - ₹5,000",
    budgetBand: "₹2,000-₹5,000",
    imageUrl:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
    baseReason:
      "A clean western co-ord gives a polished look while keeping the outfit modern and easy to style.",
  },
  {
    outfitId: "outfit_formal_001",
    title: "Tailored Formal Shirt & Trouser",
    style: "Formal",
    fabric: "Cotton",
    fitType: "Slim",
    priceRange: "₹2,000 - ₹5,000",
    budgetBand: "₹2,000-₹5,000",
    imageUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop",
    baseReason:
      "A tailored formal outfit improves structure and gives a sharp appearance for work or formal occasions.",
  },
  {
    outfitId: "outfit_sportswear_001",
    title: "Performance Sportswear Set",
    style: "Sportswear",
    fabric: "Polyester / Blends",
    fitType: "Regular",
    priceRange: "₹1,000 - ₹2,000",
    budgetBand: "₹1,000-₹2,000",
    imageUrl:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop",
    baseReason:
      "A flexible sportswear set supports movement and is better for active use than structured fabrics.",
  },
  {
    outfitId: "outfit_indowestern_001",
    title: "Indo-Western Jacket Look",
    style: "Indo-Western",
    fabric: "Silk",
    fitType: "Regular",
    priceRange: "Above ₹5,000",
    budgetBand: "Above ₹5,000",
    imageUrl:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop",
    baseReason:
      "An Indo-Western jacket look balances traditional detailing with a modern silhouette for premium occasions.",
  },
];

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeBudget(value) {
  return String(value || "")
    .replace(/\s+/g, "")
    .replace("–", "-")
    .trim();
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createDemoOtp() {
  if (process.env.NODE_ENV === "production" && process.env.REAL_SMS_ENABLED === "true") {
    return String(Math.floor(100000 + Math.random() * 900000));
  }

  return "123456";
}

function getRecommendedSize(body = {}) {
  if (body?.scanResult?.recommendedSize) {
    return body.scanResult.recommendedSize;
  }

  if (body?.size) {
    return body.size;
  }

  const height = Number(body?.heightCm);

  if (!Number.isFinite(height) || height <= 0) {
    return "M";
  }

  if (height < 150) return "S";
  if (height <= 165) return "M";
  if (height <= 180) return "L";
  if (height <= 190) return "XL";

  return "2XL";
}

function getPreferredFit(body = {}, preferences = {}) {
  if (preferences?.fit) {
    return preferences.fit;
  }

  if (body?.scanResult?.fitType) {
    return body.scanResult.fitType;
  }

  return "Regular";
}

function getBodyTypeReason(bodyType) {
  const key = normalizeText(bodyType);

  if (key.includes("rectangle")) {
    return "The selected body type benefits from outfits that add mild structure and shape.";
  }

  if (key.includes("triangle") || key.includes("pear")) {
    return "The selected body type benefits from balanced upper-body styling and comfortable lower-body fit.";
  }

  if (key.includes("inverted")) {
    return "The selected body type benefits from clean shoulder balance and a comfortable lower silhouette.";
  }

  if (key.includes("oval") || key.includes("round")) {
    return "The selected body type benefits from relaxed structure and smoother midsection comfort.";
  }

  if (key.includes("hourglass")) {
    return "The selected body type benefits from balanced cuts that keep the waistline defined.";
  }

  return "The outfit is selected to match the available size, fit, and style information.";
}

function calculateMatchScore(outfit, preferences = {}, body = {}) {
  let score = 72;

  const selectedStyle = normalizeText(preferences?.style);
  const selectedFabricList = Array.isArray(preferences?.fabric)
    ? preferences.fabric.map(normalizeText)
    : [];
  const selectedFit = normalizeText(preferences?.fit);
  const selectedBudget = normalizeBudget(preferences?.budget);

  if (selectedStyle && normalizeText(outfit.style) === selectedStyle) {
    score += 12;
  }

  if (
    selectedFabricList.length > 0 &&
    selectedFabricList.includes(normalizeText(outfit.fabric))
  ) {
    score += 6;
  }

  if (selectedFit && normalizeText(outfit.fitType) === selectedFit) {
    score += 5;
  }

  if (selectedBudget && normalizeBudget(outfit.budgetBand) === selectedBudget) {
    score += 5;
  }

  if (body?.scanResult?.recommendedSize || body?.size) {
    score += 3;
  }

  return Math.max(68, Math.min(score, 98));
}

function calculateSizeConfidence(body = {}, preferences = {}) {
  let confidence = 70;

  if (body?.scanResult?.recommendedSize) confidence += 12;
  if (body?.scanResult?.height || body?.heightCm || body?.heightRange) {
    confidence += 7;
  }
  if (body?.bodyType) confidence += 5;
  if (body?.size) confidence += 4;
  if (preferences?.fit) confidence += 2;

  return Math.max(70, Math.min(confidence, 96));
}

function getFilteredCatalog(preferences = {}) {
  const selectedStyle = normalizeText(preferences?.style);
  const selectedBudget = normalizeBudget(preferences?.budget);

  let results = OUTFIT_CATALOG;

  if (selectedStyle) {
    const styleMatches = results.filter(
      (item) => normalizeText(item.style) === selectedStyle
    );

    if (styleMatches.length > 0) {
      results = styleMatches;
    }
  }

  if (selectedBudget) {
    const budgetMatches = results.filter(
      (item) => normalizeBudget(item.budgetBand) === selectedBudget
    );

    if (budgetMatches.length > 0) {
      results = budgetMatches;
    }
  }

  if (results.length < 3) {
    const extraItems = OUTFIT_CATALOG.filter(
      (item) => !results.some((selected) => selected.outfitId === item.outfitId)
    );

    results = [...results, ...extraItems].slice(0, 3);
  }

  return results.slice(0, 4);
}

app.get("/health", (_req, res) => {
  res.status(200).json(health);
});

app.get("/ready", (_req, res) => {
  res.status(200).json({
    status: "ready",
  });
});

app.get("/auth/google/url", (req, res) => {
  const redirectUri = req.query.redirectUri;
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return res.json({
      success: false,
      configured: false,
      message:
        "Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable real Google account chooser.",
    });
  }

  if (!redirectUri) {
    return res.status(400).json({
      success: false,
      message: "redirectUri is required.",
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  return res.json({
    success: true,
    configured: true,
    authUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  });
});

app.post("/auth/google/callback", async (req, res) => {
  const { code, redirectUri } = req.body || {};

  if (!code || !redirectUri) {
    return res.status(400).json({
      success: false,
      message: "Google authorization code and redirectUri are required.",
    });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(400).json({
      success: false,
      message:
        "Google OAuth credentials are missing. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend environment variables.",
    });
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(401).json({
        success: false,
        message: "Google token exchange failed.",
        details: tokenData?.error_description || tokenData?.error || "",
      });
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const googleUser = await userResponse.json();

    if (!userResponse.ok) {
      return res.status(401).json({
        success: false,
        message: "Unable to read Google profile.",
      });
    }

    return res.json({
      success: true,
      user: {
        id: googleUser.sub,
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
        provider: "google",
      },
      token: tokenData.id_token || tokenData.access_token,
    });
  } catch (error) {
    logger.error(error);

    return res.status(500).json({
      success: false,
      message: "Google sign-in failed.",
    });
  }
});

app.post("/auth/login", (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  return res.json({
    success: true,
    user: {
      id: "u_001",
      email,
    },
    token: "mock_token_google",
  });
});

app.post("/auth/mobile/request-otp", (req, res) => {
  const { countryCode, countryName, phone, fullPhone } = req.body || {};

  if (!countryCode || !phone || !fullPhone) {
    return res.status(400).json({
      success: false,
      message: "Country code and mobile number are required.",
    });
  }

  const otp = createDemoOtp();
  const requestId = createId("otp");

  otpRequests.set(requestId, {
    otp,
    phone,
    fullPhone,
    countryCode,
    countryName,
    createdAt: Date.now(),
    expiresAt: Date.now() + 5 * 60 * 1000,
    attempts: 0,
  });

  logger.info(
    {
      route: "/auth/mobile/request-otp",
      fullPhone,
      requestId,
    },
    "OTP generated"
  );

  return res.json({
    success: true,
    requestId,
    fullPhone,
    message: `OTP sent to ${fullPhone}.`,
    developmentOtp:
      process.env.NODE_ENV === "production" && process.env.REAL_SMS_ENABLED === "true"
        ? undefined
        : otp,
  });
});

app.post("/auth/mobile/verify-otp", (req, res) => {
  const { requestId, otp, fullPhone, countryCode, phone } = req.body || {};

  if (!requestId || !otp) {
    return res.status(400).json({
      success: false,
      message: "Request ID and OTP are required.",
    });
  }

  const record = otpRequests.get(requestId);

  if (!record) {
    return res.status(400).json({
      success: false,
      message: "OTP request not found. Please request a new OTP.",
    });
  }

  if (Date.now() > record.expiresAt) {
    otpRequests.delete(requestId);

    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new OTP.",
    });
  }

  record.attempts += 1;

  if (record.attempts > 5) {
    otpRequests.delete(requestId);

    return res.status(429).json({
      success: false,
      message: "Too many incorrect attempts. Please request a new OTP.",
    });
  }

  if (String(record.otp) !== String(otp)) {
    return res.status(401).json({
      success: false,
      message: "Incorrect OTP. Please try again.",
    });
  }

  otpRequests.delete(requestId);

  return res.json({
    success: true,
    user: {
      id: createId("mobile_user"),
      phone: phone || record.phone,
      countryCode: countryCode || record.countryCode,
      fullPhone: fullPhone || record.fullPhone,
      provider: "mobile_otp",
    },
    token: `mobile_token_${Date.now()}`,
  });
});

app.post("/auth/otp", (req, res) => {
  const { phone } = req.body || {};

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: "Phone is required",
    });
  }

  return res.json({
    success: true,
    user: {
      id: "u_002",
      phone,
    },
    token: "mock_token_otp",
  });
});

app.post("/user/profile", (req, res) => {
  logger.info(
    {
      route: "/user/profile",
    },
    "profile received"
  );

  return res.json({
    success: true,
    data: req.body,
  });
});

app.post("/scan/body", (req, res) => {
  return res.json({
    success: true,
    data: {
      height: req.body?.height || req.body?.heightCm || 172,
      bodyProportions: req.body?.bodyProportions || {
        shoulderToHipRatio: 1.04,
        torsoToLegRatio: 0.92,
      },
      recommendedSize: req.body?.recommendedSize || "M",
      fitType: req.body?.fitType || "Regular",
      confidence: 0.86,
    },
  });
});

app.post("/recommendations", (req, res) => {
  const {
    userId = "guest_user",
    profile = {},
    body = {},
    preferences = {},
  } = req.body || {};

  const recommendedSize = getRecommendedSize(body);
  const preferredFit = getPreferredFit(body, preferences);
  const sizeConfidence = calculateSizeConfidence(body, preferences);
  const bodyTypeReason = getBodyTypeReason(body?.bodyType);

  const recommendations = getFilteredCatalog(preferences)
    .map((outfit) => {
      const matchScore = calculateMatchScore(outfit, preferences, body);

      return {
        outfitId: outfit.outfitId,
        title: outfit.title,
        imageUrl: outfit.imageUrl,
        style: outfit.style,
        fabric: outfit.fabric,
        recommendedSize,
        fitType: preferences?.fit || outfit.fitType || preferredFit,
        matchScore,
        sizeConfidence,
        priceRange: outfit.priceRange,
        whyThisSuitsYou: `${outfit.baseReason} ${bodyTypeReason}`,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return res.json({
    success: true,
    userId,
    profileSummary: {
      ageRange: profile?.ageRange || "",
      gender: profile?.gender || "",
      bodyType: body?.bodyType || "",
      heightCm: body?.heightCm || body?.scanResult?.height || "",
      selectedStyle: preferences?.style || "",
      selectedBudget: preferences?.budget || "",
    },
    confidenceScore:
      recommendations.length > 0
        ? Math.round(
            recommendations.reduce(
              (sum, item) => sum + item.sizeConfidence,
              0
            ) / recommendations.length
          )
        : sizeConfidence,
    recommendations,
    generatedAt: new Date().toISOString(),
  });
});

app.post("/fit-card", (req, res) => {
  return res.json({
    fitCardId: "fc_001",
    userId: req.body.userId || "guest_user",
    summary: "Balanced fit profile",
    measurements: req.body.measurements || {},
    selectedOutfit: req.body.selectedOutfit || null,
    selectedExpert: req.body.selectedExpert || null,
    notes:
      req.body.notes ||
      "Use the selected size, fit preference, body type, and style preferences while preparing the outfit.",
    generatedAt: new Date().toISOString(),
  });
});

app.get("/tailors", (_req, res) => {
  return res.json([
    {
      id: "t1",
      name: "Urban Tailor Studio",
      rating: 4.7,
      location: "City Center",
      priceRange: "₹1,500 - ₹4,000",
      deliveryTime: "5 - 7 days",
      specialization: "Casual, formal, and alteration",
      phone: "+91 90000 00001",
      address: "City Center, Main Road",
      portfolioImages: [
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1200&auto=format&fit=crop",
      ],
      reviews: [
        {
          user: "Aarav",
          text: "Good fit and timely delivery.",
          rating: 4.7,
        },
      ],
    },
    {
      id: "t2",
      name: "Regal Designer Boutique",
      rating: 4.8,
      location: "Within City",
      priceRange: "₹3,000 - ₹8,000",
      deliveryTime: "7 - 12 days",
      specialization: "Wedding, ethnic, and designer wear",
      phone: "+91 90000 00002",
      address: "Boutique Street, Central Market",
      portfolioImages: [
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1200&auto=format&fit=crop",
      ],
      reviews: [
        {
          user: "Meera",
          text: "Beautiful design and premium finish.",
          rating: 4.8,
        },
      ],
    },
  ]);
});

app.post("/booking", (req, res) => {
  return res.status(201).json({
    bookingId: "b_001",
    status: "Accepted",
    timeline: [
      {
        label: "Accepted",
        completed: true,
        time: new Date().toISOString(),
      },
      {
        label: "In Progress",
        completed: false,
      },
      {
        label: "Stitching",
        completed: false,
      },
      {
        label: "Ready",
        completed: false,
      },
      {
        label: "Shipped / Ready for Pickup",
        completed: false,
      },
    ],
    ...req.body,
  });
});

app.use((err, _req, res, _next) => {
  logger.error(err);

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`API running on :${PORT}`);
});
