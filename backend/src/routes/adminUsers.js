const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");
const { listUsers, createUser, patchUser } = require("../controllers/adminUsersController");

const router = express.Router();

router.get("/admin/users", requireAuth, requireRole("admin"), listUsers);
router.post("/admin/users", requireAuth, requireRole("admin"), createUser);
router.patch("/admin/users/:id", requireAuth, requireRole("admin"), patchUser);

module.exports = { adminUsersRouter: router };
