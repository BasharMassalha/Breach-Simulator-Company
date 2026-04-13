const { getPool } = require("../db/pool");

const SAFE_USER_COLUMNS = `
  id,
  email,
  role,
  is_active,
  last_login_at,
  created_at,
  updated_at
`;

async function findUserByEmail(email) {
  const pool = getPool();
  const res = await pool.query(
    `
      select
        ${SAFE_USER_COLUMNS},
        password_hash
      from users
      where email = $1
      limit 1
    `,
    [email]
  );
  return res.rows[0] ?? null;
}

async function findUserById(id) {
  const pool = getPool();
  const res = await pool.query(
    `
      select
        ${SAFE_USER_COLUMNS}
      from users
      where id = $1
      limit 1
    `,
    [id]
  );
  return res.rows[0] ?? null;
}

async function updateLastLoginAt(id) {
  const pool = getPool();
  await pool.query(`update users set last_login_at = now() where id = $1`, [id]);
}

async function listUsers() {
  const pool = getPool();
  const res = await pool.query(
    `
      select ${SAFE_USER_COLUMNS}
      from users
      order by created_at desc
    `
  );
  return res.rows;
}

async function insertUser({ email, password_hash, role, is_active }) {
  const pool = getPool();
  const res = await pool.query(
    `
      insert into users (email, password_hash, role, is_active)
      values ($1, $2, $3, $4)
      returning ${SAFE_USER_COLUMNS}
    `,
    [email, password_hash, role, is_active]
  );
  return res.rows[0] ?? null;
}

async function updateUserById(id, { role, is_active }) {
  const pool = getPool();
  const entries = Object.entries({ role, is_active }).filter(([, v]) => v !== undefined);
  if (entries.length === 0) {
    return findUserById(id);
  }
  const sets = entries.map(([k], i) => `${k} = $${i + 1}`);
  const vals = entries.map(([, v]) => v);
  vals.push(id);
  const res = await pool.query(
    `
      update users
      set ${sets.join(", ")}
      where id = $${vals.length}
      returning ${SAFE_USER_COLUMNS}
    `,
    vals
  );
  return res.rows[0] ?? null;
}

module.exports = {
  findUserByEmail,
  findUserById,
  updateLastLoginAt,
  listUsers,
  insertUser,
  updateUserById,
};