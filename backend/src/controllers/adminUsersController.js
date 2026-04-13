const {
  createAdminUserSchema,
  patchAdminUserSchema,
  uuidParamSchema,
} = require("../validators/adminUsersValidators");
const {
  listUsersForAdmin,
  createUserByAdmin,
  patchUserByAdmin,
} = require("../services/adminUsersService");

function validationError(issues) {
  return {
    error: "ValidationError",
    message: "Invalid request",
    issues: issues.map((i) => ({ path: i.path, message: i.message })),
  };
}

async function listUsers(req, res, next) {
  try {
    const users = await listUsersForAdmin();
    return res.status(200).json({ users });
  } catch (err) {
    return next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const parsed = createAdminUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues));
    }
    const { user, profile } = await createUserByAdmin(req, parsed.data);
    return res.status(201).json({ user, profile });
  } catch (err) {
    return next(err);
  }
}

async function patchUser(req, res, next) {
  try {
    const idParsed = uuidParamSchema.safeParse(req.params.id);
    if (!idParsed.success) {
      return res.status(400).json({ error: "ValidationError", message: "Invalid user id" });
    }

    const parsed = patchAdminUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues));
    }

    const user = await patchUserByAdmin(req, idParsed.data, parsed.data);
    return res.status(200).json({ user });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listUsers, createUser, patchUser };
