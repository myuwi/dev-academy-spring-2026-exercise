import { pgTable, bigint, date, timestamp, numeric } from "drizzle-orm/pg-core";

export const electricityData = pgTable("electricitydata", {
  id: bigint("id", { mode: "number" }).primaryKey().notNull(),
  date: date("date"),
  startTime: timestamp("starttime", { mode: "string" }),
  productionAmount: numeric("productionamount", { precision: 11, scale: 5 }),
  consumptionAmount: numeric("consumptionamount", { precision: 11, scale: 3 }),
  hourlyPrice: numeric("hourlyprice", { precision: 6, scale: 3 }),
});
