/**
 * Role-based access control. Use after `requireAuth` so `req.user` is set.
 * @param {...string} allowedRoles - e.g. requireRole("admin")
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden", message: "Insufficient permissions" });
    }
    return next();
  };
}

module.exports = { requireRole };
