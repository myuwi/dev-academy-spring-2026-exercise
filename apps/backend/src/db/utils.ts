import { Column, SQL, sql } from "drizzle-orm";

export const utcToHelsinki = (value: SQL | Column) => {
  return sql`(${value} AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/Helsinki')`;
};
