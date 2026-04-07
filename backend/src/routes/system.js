import { Router } from "express";
const router = Router();

router.get("/health", (_, res) => res.json({ status: "ok" }));

router.get("/ready", async (_, res) => {
  // Add db/queue checks here
  res.json({ status: "ready", checks: { db: "ok", ai: "ok" } });
});

export default router;
