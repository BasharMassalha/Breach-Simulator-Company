const { patchProfileSchema, uuidParamSchema } = require("../validators/profileValidators");
const {
  getProfileForUser,
  patchOwnProfile,
  getProfileAsAdmin,
  patchProfileAsAdmin,
} = require("../services/profilesService");

function validationError(issues) {
  return {
    error: "ValidationError",
    message: "Invalid request",
    issues: issues.map((i) => ({ path: i.path, message: i.message })),
  };
}

async function getMyProfile(req, res, next) {
  try {
    const profile = await getProfileForUser(req.user.id);
    return res.status(200).json({ profile });
  } catch (err) {
    return next(err);
  }
}

async function patchMyProfile(req, res, next) {
  try {
    const parsed = patchProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues));
    }
    const profile = await patchOwnProfile(req, req.user.id, parsed.data);
    return res.status(200).json({ profile });
  } catch (err) {
    return next(err);
  }
}

async function getAdminProfile(req, res, next) {
  try {
    const idParsed = uuidParamSchema.safeParse(req.params.userId);
    if (!idParsed.success) {
      return res.status(400).json({ error: "ValidationError", message: "Invalid user id" });
    }
    const { user, profile } = await getProfileAsAdmin(req, idParsed.data);
    return res.status(200).json({ user, profile });
  } catch (err) {
    return next(err);
  }
}

async function patchAdminProfile(req, res, next) {
  try {
    const idParsed = uuidParamSchema.safeParse(req.params.userId);
    if (!idParsed.success) {
      return res.status(400).json({ error: "ValidationError", message: "Invalid user id" });
    }
    const parsed = patchProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues));
    }
    const { user, profile } = await patchProfileAsAdmin(req, idParsed.data, parsed.data);
    return res.status(200).json({ user, profile });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getMyProfile,
  patchMyProfile,
  getAdminProfile,
  patchAdminProfile,
};
