const { findUserById } = require("../models/usersModel");
const { findProfileByUserId, updateProfileByUserId } = require("../models/employeeProfilesModel");
const { logAudit } = require("./auditService");

async function getProfileForUser(userId) {
  const profile = await findProfileByUserId(userId);
  if (!profile) {
    const err = new Error("Profile not found");
    err.statusCode = 404;
    throw err;
  }
  return profile;
}

async function patchOwnProfile(req, userId, input) {
  const profile = await updateProfileByUserId(userId, input);
  if (!profile) {
    const err = new Error("Profile not found");
    err.statusCode = 404;
    throw err;
  }

  await logAudit(req, {
    actor_user_id: req.user.id,
    action: "profile.update.self",
    entity_type: "employee_profile",
    entity_id: userId,
    metadata: { fields: Object.keys(input) },
  });

  return profile;
}

async function getProfileAsAdmin(req, targetUserId) {
  const user = await findUserById(targetUserId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const profile = await findProfileByUserId(targetUserId);
  if (!profile) {
    const err = new Error("Profile not found");
    err.statusCode = 404;
    throw err;
  }

  await logAudit(req, {
    actor_user_id: req.user.id,
    action: "admin.profile.read",
    entity_type: "employee_profile",
    entity_id: targetUserId,
    metadata: { target_user_id: targetUserId },
  });

  return { user, profile };
}

async function patchProfileAsAdmin(req, targetUserId, input) {
  const user = await findUserById(targetUserId);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const existing = await findProfileByUserId(targetUserId);
  if (!existing) {
    const err = new Error("Profile not found");
    err.statusCode = 404;
    throw err;
  }

  const profile = await updateProfileByUserId(targetUserId, input);

  await logAudit(req, {
    actor_user_id: req.user.id,
    action: "admin.profile.update",
    entity_type: "employee_profile",
    entity_id: targetUserId,
    metadata: { target_user_id: targetUserId, fields: Object.keys(input) },
  });

  return { user, profile };
}

module.exports = {
  getProfileForUser,
  patchOwnProfile,
  getProfileAsAdmin,
  patchProfileAsAdmin,
};
