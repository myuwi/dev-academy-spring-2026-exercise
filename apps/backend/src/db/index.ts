import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

const client = new SQL(process.env.DATABASE_URL!);

// Retain the original db connection across HMR updates in development
const globalThis_ = globalThis as unknown as {
  db?: ReturnType<typeof drizzle<typeof schema, SQL>>;
};

const db = globalThis_.db ?? drizzle({ client, schema });
if (process.env.NODE_ENV !== "production") globalThis_.db = db;

export { db };
