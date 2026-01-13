import { bigint, pgTable, date, timestamp, numeric } from "drizzle-orm/pg-core";

export const electricityData = pgTable("electricitydata", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity().notNull(),
  date: date("date").notNull(),
  startTime: timestamp("starttime", { mode: "string" }).unique().notNull(),
  productionAmount: numeric("productionamount", { precision: 11, scale: 5 }),
  consumptionAmount: numeric("consumptionamount", { precision: 11, scale: 3 }),
  hourlyPrice: numeric("hourlyprice", { precision: 6, scale: 3 }),
});
