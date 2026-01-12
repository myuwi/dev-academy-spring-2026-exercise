import { Column, SQL, sql } from "drizzle-orm";

export const coalesce = <T>(value: SQL<T> | Column, defaultValue: SQL<T> | Column | T) => {
  return sql<T>`COALESCE(${value}, ${defaultValue})`;
};
