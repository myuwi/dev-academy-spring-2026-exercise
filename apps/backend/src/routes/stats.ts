import { zValidator } from "@hono/zod-validator";
import { and, asc, count, eq, gte, ilike, lt, lte, SQL, sql } from "drizzle-orm";
import { Hono } from "hono";
import * as z from "zod";
import { db } from "../db";
import { electricityDataTz } from "../db/schema";
import { GetStatsQuerySchema } from "../schemas/stats";

const stats = new Hono();

stats.get("/", zValidator("query", GetStatsQuerySchema), async (c) => {
  const {
    limit = 50,
    offset = 0,
    sortBy = "date",
    sortDirection = "asc",
    search = "",
    filters = {},
  } = c.req.valid("query");

  // Iterate over the consecutive negative price hour groupings of each day,
  // assigning a "negative since" value for each negative price hour
  const negativeSince = db
    .select({
      date: sql`${electricityDataTz.date}`.as("date_n"),
      negativeSince: sql<number>`
        extract(hour from ${electricityDataTz.startTime}) - row_number() over (
          partition by ${electricityDataTz.date}
          order by ${electricityDataTz.startTime}
        ) + 1
      `.as("negative_since"),
    })
    .from(electricityDataTz)
    .where(lt(electricityDataTz.hourlyPrice, "0"))
    .orderBy(electricityDataTz.startTime)
    .as("negative_since");

  // Calculate the length of each negative price streak by counting the number
  // of hours that have the same hour as their "negative since" hour
  const negativeStreaks = db
    .select({
      date: negativeSince.date,
      negativeSince: negativeSince.negativeSince,
      length: count().as("streak_length"),
    })
    .from(negativeSince)
    .groupBy(negativeSince.date, negativeSince.negativeSince)
    .as("negative_streaks");

  // Calculate daily aggregates and apply filters
  // prettier-ignore
  const select = {
    date: electricityDataTz.date,
    totalProduction: sql<number | null>`cast(sum(${electricityDataTz.productionAmount}) as float)`.as("total_production"),
    totalConsumption: sql<number | null>`cast(sum(${electricityDataTz.consumptionAmount}) / 1000 as float)`.as("total_consumption"),
    averagePrice: sql<number | null>`cast(avg(${electricityDataTz.hourlyPrice}) as float)`.as("average_price"),
    longestNegativePriceHours: sql<number>`cast(coalesce(max(${negativeStreaks.length}), 0) as int)`.as("longest_negative_hours"),
  };
  const query = db
    .select(select)
    .from(electricityDataTz)
    .leftJoin(
      negativeStreaks,
      and(
        eq(electricityDataTz.date, negativeStreaks.date),
        eq(sql`extract(hour from ${electricityDataTz.startTime})`, negativeStreaks.negativeSince),
      ),
    )
    .groupBy(electricityDataTz.date)
    .having((stats) => {
      let clauses: SQL[] = [];

      // This looks kind of cursed but is also probably the simplest way to do this :)
      if (search) clauses.push(ilike(sql`${stats.date}::text`, `%${search}%`));
      if (filters.startDate) clauses.push(gte(sql`${stats.date}::text`, filters.startDate));
      if (filters.endDate) clauses.push(lte(sql`${stats.date}::text`, filters.endDate));
      if (filters.minProduction) clauses.push(gte(stats.totalProduction, filters.minProduction));
      if (filters.maxProduction) clauses.push(lte(stats.totalProduction, filters.maxProduction));
      if (filters.minConsumption) clauses.push(gte(stats.totalConsumption, filters.minConsumption));
      if (filters.maxConsumption) clauses.push(lte(stats.totalConsumption, filters.maxConsumption));
      if (filters.minAveragePrice) clauses.push(gte(stats.averagePrice, filters.minAveragePrice));
      if (filters.maxAveragePrice) clauses.push(lte(stats.averagePrice, filters.maxAveragePrice));
      if (filters.minLongestNegativePriceHours)
        clauses.push(gte(stats.longestNegativePriceHours, filters.minLongestNegativePriceHours));
      if (filters.maxLongestNegativePriceHours)
        clauses.push(lte(stats.longestNegativePriceHours, filters.maxLongestNegativePriceHours));

      return and(...clauses);
    })
    .orderBy((stats) =>
      sortDirection === "asc"
        ? sql`${stats[sortBy]} ASC NULLS FIRST`
        : sql`${stats[sortBy]} DESC NULLS LAST`,
    )
    .as("query");

  // Get total row count and final data with limit and offset using the composed query
  const { total } = (await db.select({ total: count() }).from(query))[0];
  const data = await db.select().from(query).limit(limit).offset(offset);

  return c.json({
    data,
    total,
  });
});

stats.get("/:date", zValidator("param", z.object({ date: z.iso.date() })), async (c) => {
  const { date } = c.req.valid("param");

  const data = await db
    .select({
      startTime: electricityDataTz.startTime,
      productionAmount: sql<number>`cast(${electricityDataTz.productionAmount} as float)`,
      // Convert from kWh to MWh
      consumptionAmount: sql<number>`cast(${electricityDataTz.consumptionAmount} / 1000 as float)`,
      hourlyPrice: sql<number>`cast(${electricityDataTz.hourlyPrice} as float)`,
    })
    .from(electricityDataTz)
    .where(eq(sql`${electricityDataTz.date}::text`, date))
    .orderBy((stats) => asc(stats.startTime));

  if (!data.length) return c.json({ message: "No data available for the chosen date." }, 404);

  return c.json({
    date,
    data,
  });
});

export default stats;
