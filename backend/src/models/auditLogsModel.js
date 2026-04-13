const { getPool } = require("../db/pool");

const AUDIT_COLUMNS = `
  id,
  actor_user_id,
  action,
  entity_type,
  entity_id,
  ip,
  user_agent,
  metadata,
  created_at,
  updated_at
`;

async function insertAuditLog({
  actor_user_id,
  action,
  entity_type,
  entity_id,
  ip,
  user_agent,
  metadata = {},
}) {
  const pool = getPool();
  await pool.query(
    `
      insert into audit_logs (actor_user_id, action, entity_type, entity_id, ip, user_agent, metadata)
      values ($1, $2, $3, $4, $5, $6, $7::jsonb)
    `,
    [actor_user_id ?? null, action, entity_type, entity_id ?? null, ip ?? null, user_agent ?? null, metadata]
  );
}

async function listAuditLogs({ actor_user_id, action, entity_type, entity_id, limit, offset }) {
  const pool = getPool();
  const clauses = [];
  const values = [];
  let i = 1;

  if (actor_user_id) {
    clauses.push(`actor_user_id = $${i++}`);
    values.push(actor_user_id);
  }
  if (action) {
    clauses.push(`action = $${i++}`);
    values.push(action);
  }
  if (entity_type) {
    clauses.push(`entity_type = $${i++}`);
    values.push(entity_type);
  }
  if (entity_id) {
    clauses.push(`entity_id = $${i++}`);
    values.push(entity_id);
  }

  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";

  values.push(limit);
  values.push(offset);

  const res = await pool.query(
    `
      select ${AUDIT_COLUMNS}
      from audit_logs
      ${where}
      order by created_at desc
      limit $${i++}
      offset $${i++}
    `,
    values
  );

  return res.rows;
}

module.exports = { insertAuditLog, listAuditLogs };
