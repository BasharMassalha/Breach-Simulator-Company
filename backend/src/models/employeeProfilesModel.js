const { getPool } = require("../db/pool");

async function findProfileByUserId(userId) {
  const pool = getPool();
  const res = await pool.query(
    `
      select user_id, full_name, title, department, phone, location, created_at, updated_at
      from employee_profiles
      where user_id = $1
      limit 1
    `,
    [userId]
  );
  return res.rows[0] ?? null;
}

async function insertProfile({ user_id, full_name, title, department, phone, location }) {
  const pool = getPool();
  const res = await pool.query(
    `
      insert into employee_profiles (user_id, full_name, title, department, phone, location)
      values ($1, $2, $3, $4, $5, $6)
      returning user_id, full_name, title, department, phone, location, created_at, updated_at
    `,
    [user_id, full_name, title ?? null, department ?? null, phone ?? null, location ?? null]
  );
  return res.rows[0];
}

async function updateProfileByUserId(userId, { full_name, title, department, phone, location }) {
  const pool = getPool();
  const fields = { full_name, title, department, phone, location };
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  if (entries.length === 0) {
    return findProfileByUserId(userId);
  }
  const sets = entries.map(([k], i) => `${k} = $${i + 1}`);
  const vals = entries.map(([, v]) => v);
  vals.push(userId);
  const res = await pool.query(
    `
      update employee_profiles
      set ${sets.join(", ")}
      where user_id = $${vals.length}
      returning user_id, full_name, title, department, phone, location, created_at, updated_at
    `,
    vals
  );
  return res.rows[0] ?? null;
}

module.exports = {
  findProfileByUserId,
  insertProfile,
  updateProfileByUserId,
};
