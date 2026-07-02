import express from "express";
import pino from "pino";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const logger = pino();

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || "";
const DB_NAME = process.env.FITGENIE_DB_NAME || "fitgenie";
const JWT_SECRET = process.env.JWT_SECRET || "";
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://fit-genie-two.vercel.app";

const allowedOrigins = (
  process.env.CORS_ORIGIN || "https://fit-genie-two.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

let mongoClient;
let mongoDb;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
  })
);

app.use(express.json({ limit: "2mb" }));

function makeHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function getDb() {
  if (!MONGODB_URI) {
    throw makeHttpError(
      503,
      "MONGODB_URI is not configured. Add MongoDB Atlas connection string in Render environment variables."
    );
  }

  if (mongoDb) {
    return mongoDb;
  }

  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();
  mongoDb = mongoClient.db(DB_NAME);

  await mongoDb.collection("users").createIndex({ email: 1 }, { unique: true, sparse: true });
  await mongoDb.collection("users").createIndex({ phone: 1 }, { unique: true, sparse: true });
  await mongoDb.collection("experts").createIndex({ active: 1, rating: -1 });
  await mongoDb.collection("outfits").createIndex({ active: 1, style: 1, budgetBand: 1 });
  await mongoDb.collection("otpRequests").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  return mongoDb;
}

function asyncHandler(handler) {
  return async function wrappedHandler(req, res, next) {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function cleanDocument(document) {
  if (!document) return null;

  return {
    ...document,
    _id: String(document._id),
  };
}

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

function createToken(user) {
  if (!JWT_SECRET) {
    throw makeHttpError(
      503,
      "JWT_SECRET is not configured. Add JWT_SECRET in Render environment variables."
    );
  }

  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "customer",
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    req.user = null;
    next();
    return;
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch (_error) {
    req.user = null;
  }

  next();
}

function getRecommendedSize(body = {}) {
  if (body?.scanResult?.recommendedSize) return body.scanResult.recommendedSize;
  if (body?.size) return body.size;

  const height = Number(body?.heightCm);

  if (!Number.isFinite(height) || height <= 0) return "M";
  if (height < 150) return "S";
  if (height <= 165) return "M";
  if (height <= 180) return "L";
  if (height <= 190) return "XL";

  return "2XL";
}

function getPreferredFit(body = {}, preferences = {}) {
  if (preferences?.fitDetails?.fit) return preferences.fitDetails.fit;
  if (preferences?.fit) return preferences.fit;
  if (body?.scanResult?.fitType) return body.scanResult.fitType;

  return "Regular";
}

function getBodyTypeReason(bodyType) {
  const key = normalizeText(bodyType);

  if (key.includes("rectangle")) {
    return "The selected body type benefits from mild structure and shape.";
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

  return "The outfit is selected using the available size, fit, and style information.";
}

function calculateMatchScore(outfit, preferences = {}, body = {}) {
  let score = 70;

  const selectedStyle = normalizeText(preferences?.style);
  const selectedBudget = normalizeBudget(preferences?.budget);
  const selectedFit = normalizeText(preferences?.fitDetails?.fit || preferences?.fit);
  const selectedFabricList = Array.isArray(preferences?.fabric)
    ? preferences.fabric.map(normalizeText)
    : [];

  if (selectedStyle && normalizeText(outfit.style) === selectedStyle) score += 12;
  if (selectedBudget && normalizeBudget(outfit.budgetBand) === selectedBudget) score += 8;
  if (selectedFit && normalizeText(outfit.fitType) === selectedFit) score += 5;

  if (
    selectedFabricList.length > 0 &&
    selectedFabricList.includes(normalizeText(outfit.fabric))
  ) {
    score += 5;
  }

  if (body?.scanResult?.recommendedSize || body?.size) score += 4;
  if (body?.bodyType) score += 3;

  return Math.max(60, Math.min(score, 98));
}

function calculateSizeConfidence(body = {}, preferences = {}) {
  let confidence = 68;

  if (body?.scanResult?.recommendedSize) confidence += 12;
  if (body?.heightCm || body?.heightRange || body?.scanResult?.detectedHeightCm) {
    confidence += 8;
  }
  if (body?.bodyType) confidence += 6;
  if (body?.size) confidence += 4;
  if (preferences?.fitDetails?.fit || preferences?.fit) confidence += 2;

  return Math.max(68, Math.min(confidence, 96));
}

function filterOutfits(outfits, preferences = {}) {
  const selectedStyle = normalizeText(preferences?.style);
  const selectedBudget = normalizeBudget(preferences?.budget);

  let results = outfits;

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

  return results.slice(0, 8);
}

function hashOtp(phone, otp) {
  return crypto
    .createHash("sha256")
    .update(`${phone}:${otp}:${JWT_SECRET}`)
    .digest("hex");
}

async function sendOtp(phone, otp) {
  const webhookUrl = process.env.SMS_PROVIDER_WEBHOOK_URL || "";

  if (!webhookUrl) {
    return false;
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.SMS_PROVIDER_AUTH || "",
    },
    body: JSON.stringify({
      phone,
      otp,
      message: `Your FitGenie OTP is ${otp}. It expires in 5 minutes.`,
    }),
  });

  return response.ok;
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "fitgenie-backend",
    mode: "real",
  });
});

app.get("/ready", asyncHandler(async (_req, res) => {
  res.status(MONGODB_URI && JWT_SECRET ? 200 : 503).json({
    status: MONGODB_URI && JWT_SECRET ? "ready" : "not_ready",
    mode: "real",
    mongodbConfigured: Boolean(MONGODB_URI),
    jwtConfigured: Boolean(JWT_SECRET),
  });
}));

app.post("/auth/login", asyncHandler(async (req, res) => {
  const db = await getDb();
  const { email, password, name } = req.body || {};

  const cleanEmail = String(email || "").trim().toLowerCase();

  if (!cleanEmail || !password) {
    res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
    return;
  }

  if (String(password).length < 6) {
    res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters.",
    });
    return;
  }

  const users = db.collection("users");
  let user = await users.findOne({ email: cleanEmail });

  if (!user) {
    const passwordHash = await bcrypt.hash(String(password), 12);

    const insertResult = await users.insertOne({
      email: cleanEmail,
      name: name || cleanEmail.split("@")[0],
      passwordHash,
      role: "customer",
      provider: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    user = await users.findOne({ _id: insertResult.insertedId });
  } else {
    const validPassword = await bcrypt.compare(
      String(password),
      user.passwordHash || ""
    );

    if (!validPassword) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    await users.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date(), updatedAt: new Date() } }
    );
  }

  const token = createToken(user);

  res.json({
    success: true,
    user: {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role || "customer",
    },
    token,
  });
}));

app.get("/auth/google/url", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const redirectUri = req.query.redirectUri || process.env.GOOGLE_REDIRECT_URI || "";

  if (!clientId || !redirectUri) {
    res.status(503).json({
      success: false,
      message: "Google login is not configured.",
    });
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: String(redirectUri),
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

  res.json({
    success: true,
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  });
});

app.get("/auth/google/callback", asyncHandler(async (req, res) => {
  const db = await getDb();

  const code = String(req.query.code || "");
  const redirectUri = String(req.query.redirectUri || process.env.GOOGLE_REDIRECT_URI || "");
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

  if (!code || !redirectUri || !clientId || !clientSecret) {
    res.redirect(`${FRONTEND_URL}/login/email?auth=failed`);
    return;
  }

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

  if (!tokenResponse.ok) {
    res.redirect(`${FRONTEND_URL}/login/email?auth=failed`);
    return;
  }

  const tokenData = await tokenResponse.json();

  const userInfoResponse = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  );

  if (!userInfoResponse.ok) {
    res.redirect(`${FRONTEND_URL}/login/email?auth=failed`);
    return;
  }

  const googleUser = await userInfoResponse.json();
  const cleanEmail = String(googleUser.email || "").trim().toLowerCase();

  const users = db.collection("users");

  await users.updateOne(
    { email: cleanEmail },
    {
      $set: {
        email: cleanEmail,
        name: googleUser.name || cleanEmail.split("@")[0],
        picture: googleUser.picture || "",
        provider: "google",
        googleId: googleUser.id,
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
      $setOnInsert: {
        role: "customer",
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  const user = await users.findOne({ email: cleanEmail });
  const token = createToken(user);

  const encodedUser = encodeURIComponent(
    JSON.stringify({
      id: String(user._id),
      email: user.email,
      name: user.name,
      picture: user.picture || "",
      role: user.role || "customer",
    })
  );

  res.redirect(
    `${FRONTEND_URL}/login/email?auth=success&token=${token}&user=${encodedUser}`
  );
}));

app.post("/auth/mobile/request-otp", asyncHandler(async (req, res) => {
  const db = await getDb();
  const phone = String(req.body?.phone || "").trim();

  if (!phone) {
    res.status(400).json({
      success: false,
      message: "Phone number is required.",
    });
    return;
  }

  const otp = String(crypto.randomInt(100000, 999999));
  const sent = await sendOtp(phone, otp);

  if (!sent) {
    res.status(503).json({
      success: false,
      message:
        "SMS provider is not configured. Add SMS_PROVIDER_WEBHOOK_URL to send real OTPs.",
    });
    return;
  }

  await db.collection("otpRequests").insertOne({
    phone,
    otpHash: hashOtp(phone, otp),
    consumed: false,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    createdAt: new Date(),
  });

  res.json({
    success: true,
    message: "OTP sent successfully.",
  });
}));

app.post("/auth/mobile/verify-otp", asyncHandler(async (req, res) => {
  const db = await getDb();
  const phone = String(req.body?.phone || "").trim();
  const otp = String(req.body?.otp || "").trim();

  if (!phone || !otp) {
    res.status(400).json({
      success: false,
      message: "Phone and OTP are required.",
    });
    return;
  }

  const otpRequest = await db.collection("otpRequests").findOne({
    phone,
    consumed: false,
    expiresAt: { $gt: new Date() },
  }, {
    sort: { createdAt: -1 },
  });

  if (!otpRequest || otpRequest.otpHash !== hashOtp(phone, otp)) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired OTP.",
    });
    return;
  }

  await db.collection("otpRequests").updateOne(
    { _id: otpRequest._id },
    { $set: { consumed: true, consumedAt: new Date() } }
  );

  const users = db.collection("users");

  await users.updateOne(
    { phone },
    {
      $set: {
        phone,
        provider: "mobile",
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
      $setOnInsert: {
        role: "customer",
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  const user = await users.findOne({ phone });
  const token = createToken(user);

  res.json({
    success: true,
    user: {
      id: String(user._id),
      phone: user.phone,
      role: user.role || "customer",
    },
    token,
  });
}));

app.post("/recommendations", optionalAuth, asyncHandler(async (req, res) => {
  const db = await getDb();

  const {
    userId = req.user?.sub || "guest_user",
    profile = {},
    body = {},
    preferences = {},
  } = req.body || {};

  const outfits = await db
    .collection("outfits")
    .find({ active: { $ne: false } })
    .sort({ priority: 1, createdAt: -1 })
    .toArray();

  if (outfits.length === 0) {
    res.status(404).json({
      success: false,
      message:
        "No real outfit catalog found. Add outfit documents to the MongoDB outfits collection.",
    });
    return;
  }

  const recommendedSize = getRecommendedSize(body);
  const preferredFit = getPreferredFit(body, preferences);
  const sizeConfidence = calculateSizeConfidence(body, preferences);
  const bodyTypeReason = getBodyTypeReason(body?.bodyType);

  const recommendations = filterOutfits(outfits, preferences)
    .map((outfit) => {
      const matchScore = calculateMatchScore(outfit, preferences, body);

      return {
        outfitId: String(outfit._id),
        title: outfit.title,
        imageUrl: outfit.imageUrl,
        style: outfit.style,
        fabric: outfit.fabric,
        recommendedSize,
        fitType: preferences?.fitDetails?.fit || outfit.fitType || preferredFit,
        matchScore,
        sizeConfidence,
        priceRange: outfit.priceRange,
        category: outfit.category || outfit.style,
        whyThisSuitsYou: `${outfit.reason || outfit.baseReason || "This outfit matches your FitGenie profile."} ${bodyTypeReason}`,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  await db.collection("recommendationRuns").insertOne({
    userId,
    profile,
    body,
    preferences,
    recommendationCount: recommendations.length,
    createdAt: new Date(),
  });

  res.json({
    success: true,
    userId,
    confidenceScore:
      recommendations.length > 0
        ? Math.round(
            recommendations.reduce((sum, item) => sum + item.sizeConfidence, 0) /
              recommendations.length
          )
        : sizeConfidence,
    recommendations,
    generatedAt: new Date().toISOString(),
  });
}));

app.get("/tailors", asyncHandler(async (_req, res) => {
  const db = await getDb();

  const experts = await db
    .collection("experts")
    .find({ active: { $ne: false } })
    .sort({ rating: -1, createdAt: -1 })
    .toArray();

  res.json(experts.map(cleanDocument));
}));

app.get("/experts", asyncHandler(async (_req, res) => {
  const db = await getDb();

  const experts = await db
    .collection("experts")
    .find({ active: { $ne: false } })
    .sort({ rating: -1, createdAt: -1 })
    .toArray();

  res.json({
    success: true,
    experts: experts.map(cleanDocument),
  });
}));

app.post("/fit-card", optionalAuth, asyncHandler(async (req, res) => {
  const db = await getDb();

  const fitCard = {
    ...req.body,
    userId: req.user?.sub || req.body?.userId || "guest_user",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const insertResult = await db.collection("fitCards").insertOne(fitCard);

  res.status(201).json({
    success: true,
    fitCardId: String(insertResult.insertedId),
    ...fitCard,
  });
}));

app.post("/booking", optionalAuth, asyncHandler(async (req, res) => {
  const db = await getDb();

  const booking = {
    ...req.body,
    userId: req.user?.sub || req.body?.userId || "guest_user",
    status: "Accepted",
    timeline: [
      { label: "Accepted", completed: true, time: new Date().toISOString() },
      { label: "In Progress", completed: false },
      { label: "Stitching", completed: false },
      { label: "Ready", completed: false },
      { label: "Shipped / Ready for Pickup", completed: false },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const insertResult = await db.collection("bookings").insertOne(booking);

  res.status(201).json({
    success: true,
    bookingId: String(insertResult.insertedId),
    ...booking,
  });
}));

app.patch("/booking/:bookingId/status", optionalAuth, asyncHandler(async (req, res) => {
  const db = await getDb();
  const { bookingId } = req.params;
  const { status } = req.body || {};

  if (!ObjectId.isValid(bookingId)) {
    res.status(400).json({
      success: false,
      message: "Invalid booking ID.",
    });
    return;
  }

  await db.collection("bookings").updateOne(
    { _id: new ObjectId(bookingId) },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    }
  );

  const booking = await db.collection("bookings").findOne({
    _id: new ObjectId(bookingId),
  });

  res.json({
    success: true,
    booking: cleanDocument(booking),
  });
}));

app.post("/feedback", optionalAuth, asyncHandler(async (req, res) => {
  const db = await getDb();

  const feedback = {
    ...req.body,
    userId: req.user?.sub || req.body?.userId || "guest_user",
    createdAt: new Date(),
  };

  const insertResult = await db.collection("feedback").insertOne(feedback);

  res.status(201).json({
    success: true,
    feedbackId: String(insertResult.insertedId),
  });
}));

app.use((error, _req, res, _next) => {
  logger.error(error);

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Something went wrong.",
  });
});

app.listen(PORT, () => {
  logger.info(`FitGenie real backend running on :${PORT}`);
});
