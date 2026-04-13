const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/rbacMiddleware");
const { list } = require("../controllers/adminAuditLogsController");

const router = express.Router();

router.get("/admin/audit-logs", requireAuth, requireRole("admin"), list);

module.exports = { adminAuditLogsRouter: router };

