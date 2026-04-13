const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { env } = require("./config/env");
const { healthRouter } = require("./routes/health");
const { authRouter } = require("./routes/auth");
const { adminUsersRouter } = require("./routes/adminUsers");
const { profilesRouter } = require("./routes/profiles");
const { ticketsRouter } = require("./routes/tickets");
const { documentsRouter } = require("./routes/documents");
const { adminAuditLogsRouter } = require("./routes/adminAuditLogs");

function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  app.use("/api", healthRouter);
  app.use("/api", authRouter);
  app.use("/api", adminUsersRouter);
  app.use("/api", profilesRouter);
  app.use("/api", ticketsRouter);
  app.use("/api", documentsRouter);
  app.use("/api", adminAuditLogsRouter);

  app.use((req, res) => {
    res.status(404).json({ error: "NotFound", message: `No route: ${req.method} ${req.path}` });
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    const status = Number(err.statusCode ?? err.status ?? 500);
    const safeMessage = env.nodeEnv === "production" ? "Internal Server Error" : String(err.message ?? err);
    res.status(status).json({ error: "ServerError", message: safeMessage });
  });

  return app;
}

module.exports = { createApp };
