import express from "express";
import pino from "pino";
import cors from "cors";
import jwt from "jsonwebtoken";
import { MongoClient } from "mongodb";
import { OAuth2Client } from "google-auth-library";
import admin from "firebase-admin";

const app = express();
const logger = pino();

const PORT = process.env.PORT || 4000;

const MONGODB_URI = process.env.MONGODB_URI || "";
const FITGENIE_DB_NAME = process.env.FITGENIE_DB_NAME || "fitgenie";
const JWT_SECRET = process.env.JWT_SECRET || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const FIREBASE_SERVICE_ACCOUNT_BASE64 =
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || "";

const allowedOrigins = (
  process.env.CORS_ORIGIN ||
  process.env.FRONTEND_URL ||
  "https://fit-genie-two.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

let mongoClient = null;
let mongoDb = null;
let firebaseAdminApp = null;

async function getDb() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Add MongoDB Atlas connection string in Render environment variables."
    );
  }

  if (mongoDb) {
    return mongoDb;
  }

  mongoClient = new MongoClient(MONGODB_URI);
  await mongoClient.connect();

  mongoDb = mongoClient.db(FITGENIE_DB_NAME);

  return mongoDb;
}

function getFirebaseAdminApp() {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  if (!FIREBASE_SERVICE_ACCOUNT_BASE64) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_BASE64 is not configured in Render backend environment variables."
    );
  }

  const serviceAccountJson = Buffer.from(
    FIREBASE_SERVICE_ACCOUNT_BASE64,
    "base64"
  ).toString("utf8");

  const serviceAccount = JSON.parse(serviceAccountJson);

  firebaseAdminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return firebaseAdminApp;
}

function createToken(user) {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured. Add JWT_SECRET in Render environment variables."
    );
  }

  return jwt.sign(
    {
      userId: String(user._id),
      email: user.email || "",
      phone: user.phone || "",
      provider: user.provider || "google",
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    picture: user.picture || "",
    provider: user.provider || "google",
  };
}

function serializeDocument(doc) {
  if (!doc) {
    return doc;
  }

  return {
    ...doc,
    _id: String(doc._id),
  };
}

async function verifyGoogleCredential(credential) {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error(
      "GOOGLE_CLIENT_ID is not configured in Render backend environment variables."
    );
  }

  if (!credential) {
    throw new Error("Google credential is required.");
  }

  const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new Error("Google account email was not returned.");
  }

  if (payload.email_verified !== true) {
    throw new Error("Google account email is not verified.");
  }

  return payload;
}

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "fitgenie-backend",
  });
});

app.get("/ready", async (_req, res) => {
  res.status(200).json({
    status: "ready",
    mode: "real",
    mongodbConfigured: Boolean(MONGODB_URI),
    jwtConfigured: Boolean(JWT_SECRET),
    googleConfigured: Boolean(GOOGLE_CLIENT_ID),
    firebaseConfigured: Boolean(FIREBASE_SERVICE_ACCOUNT_BASE64),
    database: FITGENIE_DB_NAME,
  });
});

app.post("/auth/google", async (req, res) => {
  try {
    const { credential } = req.body || {};

    const googleProfile = await verifyGoogleCredential(credential);
    const db = await getDb();

    const users = db.collection("users");
    const now = new Date();

    await users.updateOne(
      {
        provider: "google",
        googleSub: googleProfile.sub,
      },
      {
        $set: {
          provider: "google",
          googleSub: googleProfile.sub,
          email: googleProfile.email,
          name: googleProfile.name || googleProfile.email,
          picture: googleProfile.picture || "",
          emailVerified: true,
          updatedAt: now,
          lastLoginAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const user = await users.findOne({
      provider: "google",
      googleSub: googleProfile.sub,
    });

    const token = createToken(user);

    res.status(200).json({
      success: true,
      user: publicUser(user),
      token,
    });
  } catch (error) {
    logger.error({ error }, "Google sign-in failed");

    res.status(401).json({
      success: false,
      message:
        error.message ||
        "Unable to complete Google sign-in. Please try again.",
    });
  }
});

app.post("/auth/firebase-phone", async (req, res) => {
  try {
    const { idToken, phone } = req.body || {};

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required.",
      });
    }

    getFirebaseAdminApp();

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!decodedToken?.uid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Firebase token.",
      });
    }

    const verifiedPhone = decodedToken.phone_number || phone || "";

    if (!verifiedPhone) {
      return res.status(400).json({
        success: false,
        message: "Verified phone number was not returned by Firebase.",
      });
    }

    const db = await getDb();
    const users = db.collection("users");
    const now = new Date();

    await users.updateOne(
      {
        provider: "firebase-phone",
        firebaseUid: decodedToken.uid,
      },
      {
        $set: {
          provider: "firebase-phone",
          firebaseUid: decodedToken.uid,
          phone: verifiedPhone,
          name: verifiedPhone,
          updatedAt: now,
          lastLoginAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const user = await users.findOne({
      provider: "firebase-phone",
      firebaseUid: decodedToken.uid,
    });

    const token = createToken(user);

    res.status(200).json({
      success: true,
      user: publicUser(user),
      token,
    });
  } catch (error) {
    logger.error({ error }, "Firebase phone login failed");

    res.status(401).json({
      success: false,
      message:
        error.message ||
        "Unable to complete Firebase phone login. Please try again.",
    });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, name } = req.body || {};

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const db = await getDb();
    const users = db.collection("users");
    const now = new Date();

    await users.updateOne(
      { provider: "email", email },
      {
        $set: {
          provider: "email",
          email,
          name: name || email,
          updatedAt: now,
          lastLoginAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      { upsert: true }
    );

    const user = await users.findOne({ provider: "email", email });
    const token = createToken(user);

    res.status(200).json({
      success: true,
      user: publicUser(user),
      token,
    });
  } catch (error) {
    logger.error({ error }, "Email login failed");

    res.status(500).json({
      success: false,
      message: error.message || "Email login failed.",
    });
  }
});

app.post("/auth/mobile/request-otp", async (_req, res) => {
  res.status(410).json({
    success: false,
    message:
      "This OTP route is no longer used. FitGenie mobile login now uses Firebase Phone Authentication.",
  });
});

app.post("/auth/mobile/verify-otp", async (_req, res) => {
  res.status(410).json({
    success: false,
    message:
      "This OTP route is no longer used. FitGenie mobile login now uses Firebase Phone Authentication.",
  });
});

app.post("/recommendations", async (req, res) => {
  try {
    const db = await getDb();

    const {
      style,
      budget,
      fabric,
      fitDetails = {},
      ageRange,
      gender,
      size,
      bodyType,
    } = req.body || {};

    const query = { active: true };

    if (style) {
      query.style = style;
    }

    if (budget) {
      query.budgetBand = budget;
    }

    if (fabric) {
      query.fabric =
        Array.isArray(fabric) && fabric.length > 0 ? { $in: fabric } : fabric;
    }

    const catalog = await db
      .collection("outfits")
      .find(query)
      .sort({ priority: 1, createdAt: -1 })
      .limit(12)
      .toArray();

    const fallbackCatalog =
      catalog.length > 0
        ? catalog
        : await db
            .collection("outfits")
            .find({ active: true })
            .sort({ priority: 1, createdAt: -1 })
            .limit(12)
            .toArray();

    if (fallbackCatalog.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No real outfit catalog found. Add outfit documents to the MongoDB outfits collection.",
        recommendations: [],
      });
    }

    const recommendations = fallbackCatalog.map((item, index) => {
      const fitScore = item.fitScore || Math.max(0.72, 0.94 - index * 0.04);

      return {
        ...serializeDocument(item),
        outfitId: String(item._id),
        fitScore,
        confidence: item.confidence || `${Math.round(fitScore * 100)}%`,
        reason:
          item.reason ||
          `Recommended for ${style || "your selected style"} preference, ${
            budget || "selected budget"
          }, ${bodyType || "body profile"}, and ${size || "size"} fit needs.`,
        fitSummary: {
          ageRange: ageRange || "",
          gender: gender || "",
          bodyType: bodyType || "",
          size: size || "",
          sleeve: fitDetails?.sleeve || "",
          length: fitDetails?.length || "",
          fit: fitDetails?.fit || "",
        },
      };
    });

    res.status(200).json({
      success: true,
      confidenceScore: recommendations[0]?.fitScore || 0.82,
      recommendations,
    });
  } catch (error) {
    logger.error({ error }, "Recommendations failed");

    res.status(500).json({
      success: false,
      message: error.message || "Unable to load recommendations.",
      recommendations: [],
    });
  }
});

app.get("/tailors", async (_req, res) => {
  try {
    const db = await getDb();

    const experts = await db
      .collection("experts")
      .find({ active: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(50)
      .toArray();

    res.status(200).json(experts.map(serializeDocument));
  } catch (error) {
    logger.error({ error }, "Tailors failed");

    res.status(500).json({
      success: false,
      message: error.message || "Unable to load experts.",
    });
  }
});

app.get("/experts", async (_req, res) => {
  try {
    const db = await getDb();

    const experts = await db
      .collection("experts")
      .find({ active: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(50)
      .toArray();

    res.status(200).json({
      success: true,
      experts: experts.map(serializeDocument),
    });
  } catch (error) {
    logger.error({ error }, "Experts failed");

    res.status(500).json({
      success: false,
      message: error.message || "Unable to load experts.",
      experts: [],
    });
  }
});

app.post("/fit-card", async (req, res) => {
  try {
    const db = await getDb();

    const fitCard = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await db.collection("fitCards").insertOne(fitCard);

    res.status(201).json({
      success: true,
      fitCardId: String(result.insertedId),
      fitCard: {
        ...fitCard,
        _id: String(result.insertedId),
      },
    });
  } catch (error) {
    logger.error({ error }, "Fit card failed");

    res.status(500).json({
      success: false,
      message: error.message || "Unable to save fit card.",
    });
  }
});

app.post("/booking", async (req, res) => {
  try {
    const db = await getDb();

    const booking = {
      ...req.body,
      status: "Accepted",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    res.status(201).json({
      success: true,
      bookingId: String(result.insertedId),
      status: "Accepted",
      booking: {
        ...booking,
        _id: String(result.insertedId),
      },
    });
  } catch (error) {
    logger.error({ error }, "Booking failed");

    res.status(500).json({
      success: false,
      message: error.message || "Unable to create booking.",
    });
  }
});

app.patch("/booking/:bookingId/status", async (req, res) => {
  try {
    const db = await getDb();

    const { bookingId } = req.params;
    const { status } = req.body || {};

    if (!bookingId || !status) {
      return res.status(400).json({
        success: false,
        message: "Booking ID and status are required.",
      });
    }

    await db.collection("bookings").updateOne(
      { bookingId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      bookingId,
      status,
    });
  } catch (error) {
    logger.error({ error }, "Booking status update failed");

    res.status(500).json({
      success: false,
      message: error.message || "Unable to update booking status.",
    });
  }
});

app.post("/feedback", async (req, res) => {
  try {
    const db = await getDb();

    const feedback = {
      ...req.body,
      createdAt: new Date(),
    };

    const result = await db.collection("feedback").insertOne(feedback);

    res.status(201).json({
      success: true,
      feedbackId: String(result.insertedId),
    });
  } catch (error) {
    logger.error({ error }, "Feedback failed");

    res.status(500).json({
      success: false,
      message: error.message || "Unable to save feedback.",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((err, _req, res, _next) => {
  logger.error({ err }, "Unhandled backend error");

  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong.",
  });
});

app.listen(PORT, () => {
  logger.info(`FitGenie API running on port ${PORT}`);
});
