import { sql } from "drizzle-orm";
import {
  bigint,
  pgTable,
  date,
  timestamp,
  numeric,
  pgView,
  QueryBuilder,
} from "drizzle-orm/pg-core";
import { utcToHelsinki } from "./utils";

const qb = new QueryBuilder();

export const electricityData = pgTable("electricitydata", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedByDefaultAsIdentity().notNull(),
  date: date("date").notNull(),
  startTime: timestamp("starttime", { mode: "string" }).unique().notNull(),
  productionAmount: numeric("productionamount", { precision: 11, scale: 5 }),
  consumptionAmount: numeric("consumptionamount", { precision: 11, scale: 3 }),
  hourlyPrice: numeric("hourlyprice", { precision: 6, scale: 3 }),
});

export const electricityDataTz = pgView("electricity_data_tz_view").as(
  qb
    .select({
      id: electricityData.id,
      date: sql`${utcToHelsinki(electricityData.startTime)}::date`.as("date"),
      startTime: sql`${utcToHelsinki(electricityData.startTime)}`.as("starttime"),
      productionAmount: electricityData.productionAmount,
      consumptionAmount: electricityData.consumptionAmount,
      hourlyPrice: electricityData.hourlyPrice,
    })
    .from(electricityData),
);
