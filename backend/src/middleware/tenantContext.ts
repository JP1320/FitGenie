export function tenantContext(req, res, next) {
  const tenantId = req.headers["x-tenant-id"];
  if (!tenantId) return res.status(400).json({ error: { code: "TENANT_REQUIRED", message: "Missing x-tenant-id" } });
  req.tenantId = String(tenantId);
  next();
}
