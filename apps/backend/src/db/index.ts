import { sleep, SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import * as schema from "./schema";

// Retain the original db connection across HMR updates in development
const globalThis_ = globalThis as unknown as {
  db?: ReturnType<typeof drizzle<typeof schema>> & {
    $client: SQL;
  };
};

const client = new SQL(process.env.DATABASE_URL!);

const db = globalThis_.db ?? drizzle({ client, schema });
if (process.env.NODE_ENV !== "production") globalThis_.db = db;

console.info("Establishing a database connection...");

let retries = 0;
const maxAttempts = 5;
const retryConnect = async () => {
  try {
    await client.connect();
  } catch (e) {
    console.error("Database connection failed:", (e as Error)?.message || e);
    if (retries > maxAttempts) {
      console.error("Maximum connection attempts reached. Terminating...");
      process.exit(1);
    }

    const timeout = 5000 * Math.pow(2, retries);
    console.info(`Waiting ${timeout / 1000} seconds and retrying connection...`);
    await sleep(timeout);
    retries++;
    await retryConnect();
  }
};
await retryConnect();
console.info("Database connection established.");

await migrate(db, { migrationsFolder: "./drizzle" });

export { db };
