const { Pool } = require("pg");
const { env } = require("../config/env");

let pool;

function createPool() {
  if (env.databaseUrl) {
    return new Pool({
      connectionString: env.databaseUrl,
    });
  }

  return new Pool({
    host: env.pg.host,
    port: env.pg.port,
    database: env.pg.database,
    user: env.pg.user,
    password: env.pg.password,
  });
}

function getPool() {
  if (!pool) pool = createPool();
  return pool;
}

async function checkDbConnection() {
  const p = getPool();
  const res = await p.query("select 1 as ok");
  return res.rows?.[0]?.ok === 1;
}

module.exports = { getPool, checkDbConnection };
