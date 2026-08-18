import { spawnSync } from "node:child_process";

function directFromPooled(databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);
    parsed.hostname = parsed.hostname.replace("-pooler", "");
    return parsed.toString();
  } catch {
    return databaseUrl.replace("-pooler.", ".");
  }
}

if (!process.env.DIRECT_URL && process.env.DATABASE_URL) {
  process.env.DIRECT_URL = directFromPooled(process.env.DATABASE_URL);
}

function run(command) {
  const result = spawnSync(command, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("prisma generate");
run("prisma migrate deploy");
run("next build");
