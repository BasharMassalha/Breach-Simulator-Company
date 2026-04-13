const { insertAuditLog } = require("../models/auditLogsModel");
const { getClientIp, getUserAgent } = require("../utils/requestMeta");

async function logAudit(req, { actor_user_id, action, entity_type, entity_id, metadata }) {
  await insertAuditLog({
    actor_user_id,
    action,
    entity_type,
    entity_id,
    ip: getClientIp(req),
    user_agent: getUserAgent(req),
    metadata: metadata ?? {},
  });
}

module.exports = { logAudit };
