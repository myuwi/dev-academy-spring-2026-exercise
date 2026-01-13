import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import { migrate } from "drizzle-orm/bun-sql/migrator";
import * as schema from "./schema";

// Retain the original db connection across HMR updates in development
const globalThis_ = globalThis as unknown as {
  db?: ReturnType<typeof drizzle<typeof schema>> & {
    $client: SQL;
  };
};

const db = globalThis_.db ?? drizzle({ client: new SQL(process.env.DATABASE_URL!), schema });
if (process.env.NODE_ENV !== "production") globalThis_.db = db;

await migrate(db, { migrationsFolder: "./drizzle" });

export { db };
