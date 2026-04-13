const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { list, getById } = require("../controllers/documentsController");

const router = express.Router();

router.get("/documents", requireAuth, list);
router.get("/documents/:id", requireAuth, getById);

module.exports = { documentsRouter: router };

