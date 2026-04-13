const bcrypt = require("bcrypt");
const { findUserByEmail, findUserById, updateLastLoginAt } = require("../models/usersModel");
const { signAccessToken } = require("../utils/jwt");

function toSafeUser(userRow) {
  if (!userRow) return null;
  // Never expose password_hash (even internally beyond auth).
  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safe } = userRow;
  return safe;
}

async function loginWithEmailPassword({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) {
    // Don’t reveal whether the email exists.
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error("Account is inactive");
    err.statusCode = 403;
    throw err;
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }

  await updateLastLoginAt(user.id);

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { token, user: toSafeUser(user) };
}

async function getCurrentUser(userId) {
  const user = await findUserById(userId);
  if (!user) return null;
  if (!user.is_active) return null;
  return user;
}

module.exports = { loginWithEmailPassword, getCurrentUser };

