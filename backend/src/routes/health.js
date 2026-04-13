const express = require("express");
const { checkDbConnection } = require("../db/pool");

const router = express.Router();

router.get("/health", async (_req, res) => {
  try {
    const dbOk = await checkDbConnection();
    res.status(200).json({ ok: true, dbOk });
  } catch (err) {
    res.status(200).json({ ok: true, dbOk: false });
  }
});
console.log("i am an health router", router);

module.exports = { healthRouter: router };
