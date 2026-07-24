import express from "express";
import pino from "pino";
import cors from "cors";
import jwt from "jsonwebtoken";
import { google } from "googleapis";
import { MongoClient } from "mongodb";
import { OAuth2Client } from "google-auth-library";

const app = express();
const logger = pino();

const PORT = process.env.PORT || 4000;

const MONGODB_URI = process.env.MONGODB_URI || "";
const FITGENIE_DB_NAME = process.env.FITGENIE_DB_NAME || "fitgenie";
const JWT_SECRET = process.env.JWT_SECRET || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID || "";
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || "";
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN || "";
const GMAIL_SENDER_EMAIL = process.env.GMAIL_SENDER_EMAIL || "";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "FitGenie";
const EMAIL_DEBUG_SECRET = process.env.EMAIL_DEBUG_SECRET || "";

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
let gmailClient = null;

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

function isMailConfigured() {
  return Boolean(
    GMAIL_CLIENT_ID &&
      GMAIL_CLIENT_SECRET &&
      GMAIL_REFRESH_TOKEN &&
      GMAIL_SENDER_EMAIL
  );
}

function getGmailClient() {
  if (!isMailConfigured()) {
    throw new Error(
      "Gmail API email is not configured. Add GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, and GMAIL_SENDER_EMAIL in Render."
    );
  }

  if (gmailClient) {
    return gmailClient;
  }

  const oauth2Client = new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: GMAIL_REFRESH_TOKEN,
  });

  gmailClient = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  return gmailClient;
}

function encodeBase64Url(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function buildRawEmail({ to, subject, text, html }) {
  const boundary = `fitgenie_${Date.now()}_${Math.random()
    .toString(16)
    .slice(2)}`;

  const message = [
    `From: ${MAIL_FROM_NAME} <${GMAIL_SENDER_EMAIL}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    html,
    "",
    `--${boundary}--`,
  ].join("\r\n");

  return encodeBase64Url(message);
}

async function sendEmailWithGmailApi({ to, subject, text, html }) {
  const gmail = getGmailClient();

  const raw = buildRawEmail({
    to,
    subject,
    text,
    html,
  });

  const result = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw,
    },
  });

  return result.data;
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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildWelcomeEmailHtml({ name, email }) {
  const safeName = escapeHtml(name || "there");
  const safeEmail = escapeHtml(email || "");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Welcome to FitGenie</title>
      </head>

      <body style="margin:0;padding:0;background:#070a18;font-family:Arial,Helvetica,sans-serif;color:#111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#070a18,#111827,#1e1b4b);padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 28px 80px rgba(0,0,0,0.35);">
                <tr>
                  <td style="padding:36px 30px;background:linear-gradient(135deg,#111827,#1e1b4b,#0f172a);color:#ffffff;text-align:center;">
                    <div style="display:inline-block;width:76px;height:76px;line-height:76px;border-radius:24px;background:linear-gradient(135deg,#facc15,#22d3ee,#7c3aed);font-size:34px;margin-bottom:18px;">
                      ✦
                    </div>

                    <h1 style="margin:0;font-size:34px;line-height:1.15;letter-spacing:-1px;">
                      Welcome to FitGenie
                    </h1>

                    <p style="margin:12px 0 0;color:#cbd5e1;font-size:15px;line-height:1.6;">
                      Thank you for creating your FitGenie account.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 30px;">
                    <p style="margin:0 0 18px;font-size:18px;line-height:1.6;color:#111827;">
                      Hi ${safeName},
                    </p>

                    <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#475569;">
                      Your <strong style="color:#111827;">FitGenie</strong> account has been created successfully using this email ID:
                    </p>

                    <div style="margin:20px 0;padding:16px 18px;border-radius:18px;background:#f8fafc;border:1px solid #e2e8f0;color:#111827;font-size:15px;font-weight:700;">
                      ${safeEmail}
                    </div>

                    <p style="margin:0 0 18px;font-size:15px;line-height:1.8;color:#475569;">
                      FitGenie helps you discover better outfit recommendations based on your
                      style, size, body profile, budget, fabric preference, and fit needs.
                      You can create your fit card, connect with suitable fashion experts,
                      and track your outfit journey from selection to delivery.
                    </p>

                    <div style="margin:24px 0;padding:20px;border-radius:22px;background:linear-gradient(135deg,#eef2ff,#ecfeff);border:1px solid #dbeafe;">
                      <h2 style="margin:0 0 12px;font-size:18px;color:#111827;">
                        What you can do with FitGenie
                      </h2>

                      <ul style="margin:0;padding-left:20px;color:#475569;font-size:15px;line-height:1.8;">
                        <li>Get AI-powered outfit and size suggestions.</li>
                        <li>Save your profile and fit preferences.</li>
                        <li>Create a fit card for tailors, designers, and boutiques.</li>
                        <li>Choose service types like tailoring, designer wear, alteration, or styling.</li>
                        <li>Track your order and share feedback after delivery.</li>
                      </ul>
                    </div>

                    <p style="margin:0 0 8px;font-size:15px;line-height:1.8;color:#475569;">
                      We’re excited to help you find your perfect fit.
                    </p>

                    <p style="margin:0;font-size:15px;line-height:1.8;color:#111827;font-weight:700;">
                      Team FitGenie
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:18px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                    <p style="margin:0;color:#64748b;font-size:12px;line-height:1.6;">
                      You received this email because a FitGenie account was created using ${safeEmail}.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildWelcomeEmailText({ name, email }) {
  return `
Hi ${name || "there"},

Thank you for creating your account with FitGenie.

Your account has been created successfully using this email ID:
${email}

FitGenie helps you discover better outfit recommendations based on your style, size, body profile, budget, fabric preference, and fit needs. You can create your fit card, connect with suitable fashion experts, and track your outfit journey from selection to delivery.

What you can do with FitGenie:
- Get AI-powered outfit and size suggestions.
- Save your profile and fit preferences.
- Create a fit card for tailors, designers, and boutiques.
- Choose service types like tailoring, designer wear, alteration, or styling.
- Track your order and share feedback after delivery.

We’re excited to help you find your perfect fit.

Team FitGenie
  `.trim();
}

async function sendWelcomeEmailInBackground({ userId }) {
  try {
    const db = await getDb();
    const users = db.collection("users");

    const user = await users.findOne({ _id: userId });

    if (!user?.email) {
      return;
    }

    if (user.welcomeEmailSentAt) {
      return;
    }

    if (!isMailConfigured()) {
      await users.updateOne(
        { _id: user._id },
        {
          $set: {
            welcomeEmailSkippedAt: new Date(),
            welcomeEmailSkippedReason: "gmail-api-not-configured",
          },
        }
      );

      return;
    }

    const staleBefore = new Date(Date.now() - 10 * 60 * 1000);

    const claim = await users.updateOne(
      {
        _id: user._id,
        welcomeEmailSentAt: { $exists: false },
        $or: [
          { welcomeEmailSendingAt: { $exists: false } },
          { welcomeEmailSendingAt: { $lt: staleBefore } },
          { welcomeEmailFailedAt: { $exists: true } },
        ],
      },
      {
        $set: {
          welcomeEmailSendingAt: new Date(),
        },
        $unset: {
          welcomeEmailFailedAt: "",
          welcomeEmailError: "",
          welcomeEmailSkippedReason: "",
        },
      }
    );

    if (claim.modifiedCount !== 1) {
      return;
    }

    const mailResult = await sendEmailWithGmailApi({
      to: user.email,
      subject: "Welcome to FitGenie - Your account has been created",
      text: buildWelcomeEmailText({
        name: user.name,
        email: user.email,
      }),
      html: buildWelcomeEmailHtml({
        name: user.name,
        email: user.email,
      }),
    });

    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          welcomeEmailSentAt: new Date(),
          welcomeEmailMessageId: mailResult.id || "",
        },
        $unset: {
          welcomeEmailSendingAt: "",
          welcomeEmailFailedAt: "",
          welcomeEmailError: "",
        },
      }
    );
  } catch (emailError) {
    logger.error({ emailError }, "Welcome email background send failed");

    try {
      const db = await getDb();

      await db.collection("users").updateOne(
        { _id: userId },
        {
          $set: {
            welcomeEmailFailedAt: new Date(),
            welcomeEmailError:
              emailError.message || "Welcome email background send failed.",
          },
          $unset: {
            welcomeEmailSendingAt: "",
          },
        }
      );
    } catch (updateError) {
      logger.error({ updateError }, "Welcome email failure update failed");
    }
  }
}

function queueWelcomeEmail({ user }) {
  if (!user?._id) {
    return;
  }

  setTimeout(() => {
    sendWelcomeEmailInBackground({ userId: user._id });
  }, 0);
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
    emailConfigured: isMailConfigured(),
    emailProvider: "gmail-api",
    database: FITGENIE_DB_NAME,
  });
});

app.post("/debug/send-test-email", async (req, res) => {
  try {
    const providedSecret = req.headers["x-debug-secret"];

    if (!EMAIL_DEBUG_SECRET || providedSecret !== EMAIL_DEBUG_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Debug secret is missing or incorrect.",
      });
    }

    const { to } = req.body || {};

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required.",
      });
    }

    if (!isMailConfigured()) {
      return res.status(500).json({
        success: false,
        message: "Gmail API email is not configured.",
        gmailApi: {
          clientId: Boolean(GMAIL_CLIENT_ID),
          clientSecret: Boolean(GMAIL_CLIENT_SECRET),
          refreshToken: Boolean(GMAIL_REFRESH_TOKEN),
          senderEmail: Boolean(GMAIL_SENDER_EMAIL),
        },
      });
    }

    const result = await sendEmailWithGmailApi({
      to,
      subject: "FitGenie test email",
      text: "This is a FitGenie test email. If you received this, Gmail API sending is working.",
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>FitGenie test email</h2>
          <p>This is a FitGenie test email.</p>
          <p>If you received this, Gmail API sending is working correctly.</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Test email sent successfully using Gmail API.",
      id: result.id || "",
      threadId: result.threadId || "",
    });
  } catch (error) {
    logger.error({ error }, "Debug Gmail API test email failed");

    res.status(500).json({
      success: false,
      message: error.message || "Gmail API test email failed.",
      code: error.code || "",
      status: error.status || "",
      errors: error.errors || [],
    });
  }
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
        email: googleProfile.email,
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
      email: googleProfile.email,
    });

    const token = createToken(user);

    queueWelcomeEmail({ user });

    res.status(200).json({
      success: true,
      user: publicUser(user),
      token,
      welcomeEmail: {
        queued: !Boolean(user.welcomeEmailSentAt),
        alreadySent: Boolean(user.welcomeEmailSentAt),
      },
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

    queueWelcomeEmail({ user });

    res.status(200).json({
      success: true,
      user: publicUser(user),
      token,
      welcomeEmail: {
        queued: !Boolean(user.welcomeEmailSentAt),
        alreadySent: Boolean(user.welcomeEmailSentAt),
      },
    });
  } catch (error) {
    logger.error({ error }, "Email login failed");

    res.status(500).json({
      success: false,
      message: error.message || "Email login failed.",
    });
  }
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
