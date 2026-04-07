import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";

export const securityMiddleware = [
  helmet(),
  cors({ origin: true, credentials: true }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
];
