const { listAuditLogs } = require("../models/auditLogsModel");

async function listAuditLogsForAdmin(filters) {
  return listAuditLogs(filters);
}

module.exports = { listAuditLogsForAdmin };

