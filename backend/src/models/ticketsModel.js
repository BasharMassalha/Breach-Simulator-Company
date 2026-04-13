const { getPool } = require("../db/pool");

const TICKET_COLUMNS = `
  id,
  created_by,
  assigned_to,
  status,
  priority,
  subject,
  description,
  created_at,
  updated_at
`;

async function insertTicket({ created_by, subject, description, priority }) {
  const pool = getPool();
  const res = await pool.query(
    `
      insert into tickets (created_by, subject, description, priority)
      values ($1, $2, $3, coalesce($4, 'medium'))
      returning ${TICKET_COLUMNS}
    `,
    [created_by, subject, description, priority ?? null]
  );
  return res.rows[0] ?? null;
}

async function listTicketsForAdmin() {
  const pool = getPool();
  const res = await pool.query(
    `
      select ${TICKET_COLUMNS}
      from tickets
      order by created_at desc
    `
  );
  return res.rows;
}

async function listTicketsForUser(userId) {
  const pool = getPool();
  const res = await pool.query(
    `
      select ${TICKET_COLUMNS}
      from tickets
      where created_by = $1
      order by created_at desc
    `,
    [userId]
  );
  return res.rows;
}

async function findTicketById(id) {
  const pool = getPool();
  const res = await pool.query(
    `
      select ${TICKET_COLUMNS}
      from tickets
      where id = $1
      limit 1
    `,
    [id]
  );
  return res.rows[0] ?? null;
}

async function updateTicketById(id, fields) {
  const pool = getPool();
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return findTicketById(id);

  const sets = entries.map(([k], i) => `${k} = $${i + 1}`);
  const vals = entries.map(([, v]) => v);
  vals.push(id);

  const res = await pool.query(
    `
      update tickets
      set ${sets.join(", ")}
      where id = $${vals.length}
      returning ${TICKET_COLUMNS}
    `,
    vals
  );
  return res.rows[0] ?? null;
}

module.exports = {
  insertTicket,
  listTicketsForAdmin,
  listTicketsForUser,
  findTicketById,
  updateTicketById,
};

