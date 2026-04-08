import express from "express";
import pino from "pino";

const app = express();
const logger = pino();
app.use(express.json());

const health = { status: "ok", service: "fitgenie-backend" };
app.get("/health", (_req, res) => res.status(200).json(health));
app.get("/ready", (_req, res) => res.status(200).json({ status: "ready" }));

app.post("/user/profile", (req, res) => {
  logger.info({ route: "/user/profile" }, "profile received");
  res.json({ success: true, data: req.body });
});

app.post("/scan/body", (req, res) => {
  res.json({ success: true, data: req.body });
});

app.post("/recommendations", (req, res) => {
  res.json({
    userId: req.body.userId,
    confidenceScore: 0.82,
    recommendations: [
      { outfitId: "outfit_1", title: "Smart Casual Set", reason: "Matches your style and budget", fitScore: 0.86 }
    ]
  });
});

app.post("/fit-card", (req, res) => {
  res.json({
    fitCardId: "fc_001",
    userId: req.body.userId,
    summary: "Balanced fit profile",
    measurements: req.body.measurements || {},
    generatedAt: new Date().toISOString()
  });
});

app.get("/tailors", (_req, res) => {
  res.json([{ id: "t1", name: "Urban Tailor Studio", rating: 4.7, location: "City Center" }]);
});

app.post("/booking", (req, res) => {
  res.status(201).json({ bookingId: "b_001", status: "Accepted", ...req.body });
});

app.use((err, _req, res, _next) => {
  logger.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong" } });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => logger.info(`API running on :${PORT}`));
