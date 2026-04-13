function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket?.remoteAddress || null;
}

function getUserAgent(req) {
  return req.headers["user-agent"] ?? null;
}

module.exports = { getClientIp, getUserAgent };
