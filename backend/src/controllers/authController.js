const { loginSchema } = require("../validators/authValidators");
const { loginWithEmailPassword } = require("../services/authService");

async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "ValidationError",
        message: "Invalid login request",
        issues: parsed.error.issues.map((i) => ({ path: i.path, message: i.message })),
      });
    }

    const { token, user } = await loginWithEmailPassword(parsed.data);
    return res.status(200).json({ token, user });
  } catch (err) {
    return next(err);
  }
}

async function me(req, res) {
  return res.status(200).json({ user: req.user });
}

module.exports = { login, me };