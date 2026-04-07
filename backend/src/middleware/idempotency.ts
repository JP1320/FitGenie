const seen = new Map<string, { status: number; body: any }>();

export function idempotencyMiddleware(req, res, next) {
  if (req.method !== "POST") return next();
  const key = req.headers["idempotency-key"] as string;
  if (!key) return next();

  const existing = seen.get(key);
  if (existing) {
    return res.status(existing.status).json(existing.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    seen.set(key, { status: res.statusCode || 200, body });
    return originalJson(body);
  };
  next();
}
