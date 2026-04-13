const { listAuditLogsQuerySchema } = require("../validators/auditLogsValidators");
const { listAuditLogsForAdmin } = require("../services/adminAuditLogsService");

function validationError(issues) {
  return {
    error: "ValidationError",
    message: "Invalid request",
    issues: issues.map((i) => ({ path: i.path, message: i.message })),
  };
}

async function list(req, res, next) {
  try {
    const parsed = listAuditLogsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json(validationError(parsed.error.issues));
    }

    const audit_logs = await listAuditLogsForAdmin(parsed.data);
    return res.status(200).json({ audit_logs });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list };

