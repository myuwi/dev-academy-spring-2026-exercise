import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { retry } from "../utils";
import * as schema from "./schema";

// Retain the original db connection across HMR updates in development
const globalThis_ = globalThis as unknown as {
  db?: ReturnType<typeof drizzle<typeof schema, Pool>>;
};

const client = new Pool({ connectionString: process.env.DATABASE_URL! });

const db = globalThis_.db ?? drizzle({ client, schema });
if (process.env.NODE_ENV !== "production") globalThis_.db = db;

console.info("Establishing a database connection...");

await retry(() => db.execute("select 1"), {
  onError: (_e, _attempt, timeout) => {
    console.error(
      `Unable to connect to the database. Waiting ${timeout / 1000} seconds before retrying connection...`,
    );
  },
});

console.info("Database connection established.");
console.info("Running migrations...");

await migrate(db, { migrationsFolder: "./drizzle" });
console.info("Migrations complete.");

export { db };
