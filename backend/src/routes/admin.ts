import { Router } from "express";
import { requirePermission } from "../middleware/rbac.js";

const router = Router();

router.get("/admin/tenants/:tenantId/users", requirePermission("users:read"), async (req, res) => {
  res.json({ ok: true, tenantId: req.params.tenantId, users: [] });
});

router.post("/admin/tenants/:tenantId/users/:userId/role", requirePermission("settings:write"), async (req, res) => {
  res.json({ ok: true, message: "Role updated" });
});

export default router;
