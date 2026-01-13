import { afterAll, afterEach, beforeAll, mock } from "bun:test";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { reset } from "drizzle-seed";
import * as schema from "../src/db/schema";

const db = drizzle({
  client: new PGlite(),
  schema,
});

await mock.module("../src/db", () => {
  return { db };
});

beforeAll(async () => {
  await migrate(db, {
    migrationsFolder: "./drizzle",
  });
});

afterEach(async () => {
  await reset(db, schema);
});

afterAll(async () => {
  await db.$client.close();
});
