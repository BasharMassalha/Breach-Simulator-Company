const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");
const {
  getMyProfile,
  patchMyProfile,
  getAdminProfile,
  patchAdminProfile,
} = require("../controllers/profilesController");

const router = express.Router();

router.get("/profiles/me", requireAuth, getMyProfile);
router.patch("/profiles/me", requireAuth, patchMyProfile);
router.get("/admin/profiles/:userId", requireAuth, requireRole("admin"), getAdminProfile);
router.patch("/admin/profiles/:userId", requireAuth, requireRole("admin"), patchAdminProfile);

module.exports = { profilesRouter: router };
