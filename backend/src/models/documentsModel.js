const { getPool } = require("../db/pool");

const DOCUMENT_COLUMNS = `
  id,
  owner_user_id,
  name,
  category,
  sensitivity,
  created_at,
  updated_at
`;

function buildWhereFromFilters(filters, startIndex = 1) {
  const clauses = [];
  const values = [];
  let i = startIndex;

  if (filters.category) {
    clauses.push(`category = $${i++}`);
    values.push(filters.category);
  }

  if (filters.sensitivity) {
    clauses.push(`sensitivity = $${i++}`);
    values.push(filters.sensitivity);
  }

  if (filters.owner_user_id) {
    clauses.push(`owner_user_id = $${i++}`);
    values.push(filters.owner_user_id);
  }

  if (filters.name) {
    clauses.push(`name ilike $${i++}`);
    values.push(`%${filters.name}%`);
  }

  return { clauses, values, nextIndex: i };
}

async function listDocumentsForAdmin(filters) {
  const pool = getPool();
  const { clauses, values } = buildWhereFromFilters(filters);
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  const res = await pool.query(
    `
      select ${DOCUMENT_COLUMNS}
      from documents
      ${where}
      order by created_at desc
    `,
    values
  );
  return res.rows;
}

async function listDocumentsForUser(userId, filters) {
  const pool = getPool();

  // Access rule for employees:
  // - can see public/internal docs
  // - can always see docs they own (including confidential)
  const accessClause = `(sensitivity in ('public', 'internal') or owner_user_id = $1)`;

  const { clauses, values } = buildWhereFromFilters(filters, 2);
  const where =
    clauses.length > 0
      ? `where ${accessClause} and ${clauses.join(" and ")}`
      : `where ${accessClause}`;

  const res = await pool.query(
    `
      select ${DOCUMENT_COLUMNS}
      from documents
      ${where}
      order by created_at desc
    `,
    [userId, ...values]
  );
  return res.rows;
}

async function findDocumentByIdForAdmin(id) {
  const pool = getPool();
  const res = await pool.query(
    `
      select ${DOCUMENT_COLUMNS}
      from documents
      where id = $1
      limit 1
    `,
    [id]
  );
  return res.rows[0] ?? null;
}

async function findDocumentByIdForUser(userId, id) {
  const pool = getPool();
  const res = await pool.query(
    `
      select ${DOCUMENT_COLUMNS}
      from documents
      where id = $2
        and (sensitivity in ('public', 'internal') or owner_user_id = $1)
      limit 1
    `,
    [userId, id]
  );
  return res.rows[0] ?? null;
}

module.exports = {
  listDocumentsForAdmin,
  listDocumentsForUser,
  findDocumentByIdForAdmin,
  findDocumentByIdForUser,
};

