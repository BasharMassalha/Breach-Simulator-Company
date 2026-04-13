const bcrypt = require("bcrypt");
const {
  findUserByEmail,
  findUserById,
  listUsers,
  insertUser,
  updateUserById,
} = require("../models/usersModel");
const { insertProfile } = require("../models/employeeProfilesModel");
const { logAudit } = require("./auditService");

const BCRYPT_ROUNDS = 12;

async function listUsersForAdmin() {
  return listUsers();
}

async function createUserByAdmin(req, input) {
  const existing = await findUserByEmail(input.email);
  if (existing) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  let user;
  try {
    user = await insertUser({
      email: input.email,
      password_hash,
      role: input.role,
      is_active: input.is_active,
    });
  } catch (e) {
    if (e.code === "23505") {
      const err = new Error("Email already in use");
      err.statusCode = 409;
      throw err;
    }
    throw e;
  }

  const profile = await insertProfile({
    user_id: user.id,
    full_name: input.full_name,
    title: input.title,
    department: input.department,
    phone: input.phone,
    location: input.location,
  });

  await logAudit(req, {
    actor_user_id: req.user.id,
    action: "admin.user.create",
    entity_type: "user",
    entity_id: user.id,
    metadata: { email: user.email, role: user.role, profile_user_id: profile.user_id },
  });

  return { user, profile };
}

async function patchUserByAdmin(req, userId, input) {
  const target = await findUserById(userId);
  if (!target) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const updated = await updateUserById(userId, {
    role: input.role,
    is_active: input.is_active,
  });

  await logAudit(req, {
    actor_user_id: req.user.id,
    action: "admin.user.update",
    entity_type: "user",
    entity_id: userId,
    metadata: {
      before: { role: target.role, is_active: target.is_active },
      after: { role: updated.role, is_active: updated.is_active },
    },
  });

  return updated;
}

module.exports = {
  listUsersForAdmin,
  createUserByAdmin,
  patchUserByAdmin,
};
