const { verifyAccessToken } = require("../utils/jwt");
const { findUserById } = require("../models/usersModel");

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

async function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized", message: "Missing Bearer token" });
    }

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (_e) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
    }

    const userId = payload?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized", message: "Invalid token payload" });
    }

    const user = await findUserById(userId);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: "Unauthorized", message: "User not found or inactive" });
    }

    req.user = user;
    req.auth = { userId: user.id, role: user.role };
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { requireAuth };

