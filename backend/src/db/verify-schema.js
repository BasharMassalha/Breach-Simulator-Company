const { getPool } = require("./pool");

async function main() {
  const pool = getPool();
  try {
    const res = await pool.query(
      "select tablename from pg_tables where schemaname = 'public' order by tablename"
    );
    for (const row of res.rows) console.log(row.tablename);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err?.message || err);
    process.exitCode = 1;
  });
}

