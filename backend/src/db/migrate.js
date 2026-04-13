const fs = require("node:fs/promises");
const path = require("node:path");
const { getPool } = require("./pool");

const MIGRATIONS_DIR = path.join(__dirname, "migrations");

async function ensureMigrationsTable(client) {
  await client.query(`
    create table if not exists schema_migrations (
      id bigserial primary key,
      filename text not null unique,
      applied_at timestamptz not null default now()
    );
  `);
}

async function getAppliedFilenames(client) {
  await ensureMigrationsTable(client);
  const res = await client.query(`select filename from schema_migrations order by filename asc;`);
  return new Set(res.rows.map((r) => r.filename));
}

async function listMigrationFiles() {
  const files = await fs.readdir(MIGRATIONS_DIR);
  return files
    .filter((f) => f.toLowerCase().endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));
}

async function applyMigration(client, filename) {
  const fullPath = path.join(MIGRATIONS_DIR, filename);
  const sql = await fs.readFile(fullPath, "utf8");

  // Each migration file is expected to be self-contained and safe to run once.
  await client.query("begin");
  try {
    await client.query(sql);
    await client.query(`insert into schema_migrations (filename) values ($1);`, [filename]);
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  }
}

async function migrate() {
  const pool = getPool();
  const client = await pool.connect();

  try {
    const files = await listMigrationFiles();
    const applied = await getAppliedFilenames(client);

    const pending = files.filter((f) => !applied.has(f));
    if (pending.length === 0) {
      console.log("[migrate] no pending migrations");
      return;
    }

    console.log(`[migrate] applying ${pending.length} migration(s)`);
    for (const filename of pending) {
      console.log(`[migrate] -> ${filename}`);
      await applyMigration(client, filename);
    }
    console.log("[migrate] done");
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  migrate().catch((err) => {
    console.error("[migrate] failed:", err?.message || err);
    if (err?.stack) console.error(err.stack);
    process.exitCode = 1;
  });
}

module.exports = { migrate };

