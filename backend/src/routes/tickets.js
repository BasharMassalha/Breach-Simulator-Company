const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { create, list, getById, patchById } = require("../controllers/ticketsController");

const router = express.Router();

router.post("/tickets", requireAuth, create);
router.get("/tickets", requireAuth, list);
router.get("/tickets/:id", requireAuth, getById);
router.patch("/tickets/:id", requireAuth, patchById);

module.exports = { ticketsRouter: router };

