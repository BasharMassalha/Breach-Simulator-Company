const bcrypt = require("bcrypt");

async function main() {
  const password = process.env.PASSWORD;
  const roundsRaw = process.env.BCRYPT_ROUNDS ?? "12";
  const rounds = Number(roundsRaw);

  if (!password) {
    console.error('Missing env var PASSWORD. Example: PASSWORD="MyPass123" npm run db:hash');
    process.exitCode = 1;
    return;
  }
  if (!Number.isInteger(rounds) || rounds < 10 || rounds > 15) {
    console.error("BCRYPT_ROUNDS must be an integer between 10 and 15.");
    process.exitCode = 1;
    return;
  }

  const hash = await bcrypt.hash(password, rounds);
  console.log(hash);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err?.message || err);
    process.exitCode = 1;
  });
}

