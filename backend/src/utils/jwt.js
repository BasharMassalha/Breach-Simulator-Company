const jwt = require("jsonwebtoken");
const { env } = require("../config/env");

function signAccessToken(payload) {
  const secret = env.requireEnv("JWT_ACCESS_SECRET");
  return jwt.sign(payload, secret, {
    expiresIn: env.jwtAccessExpiresIn,
    audience: "breach-simulator-company",
    issuer: "breach-simulator-company-api",
  });
}

function verifyAccessToken(token) {
  const secret = env.requireEnv("JWT_ACCESS_SECRET");
  return jwt.verify(token, secret, {
    audience: "breach-simulator-company",
    issuer: "breach-simulator-company-api",
  });
}

module.exports = { signAccessToken, verifyAccessToken };

