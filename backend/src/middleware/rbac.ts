type Role = "owner" | "admin" | "operator" | "viewer";
const rolePermissions: Record<Role, string[]> = {
  owner: ["*"],
  admin: ["users:read", "users:write", "orders:read", "orders:write", "settings:write"],
  operator: ["orders:read", "orders:write"],
  viewer: ["users:read", "orders:read"]
};

export function requirePermission(permission: string) {
  return (req, res, next) => {
    const role = (req.user?.role || "viewer") as Role;
    const perms = rolePermissions[role] || [];
    if (perms.includes("*") || perms.includes(permission)) return next();
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Insufficient permissions" } });
  };
}
