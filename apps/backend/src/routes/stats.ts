import { zValidator } from "@hono/zod-validator";
import { and, asc, count, eq, gte, ilike, lt, lte, SQL, sql } from "drizzle-orm";
import { Hono } from "hono";
import * as z from "zod";
import { db } from "../db";
import { electricityData } from "../db/schema";
import { GetStatsQuerySchema } from "../schemas/stats";

const stats = new Hono();

// TODO: Take timezone into account when doing aggregations

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
      date: electricityData.date,
      negativeSince: sql<number>`
        extract(hour from ${electricityData.startTime}) - row_number() over (
          partition by ${electricityData.date}
          order by ${electricityData.startTime}
        ) + 1
      `.as("negative_since"),
    })
    .from(electricityData)
    .where(lt(electricityData.hourlyPrice, "0"))
    .orderBy(electricityData.startTime)
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
    date: electricityData.date,
    totalProduction: sql<number | null>`cast(sum(${electricityData.productionAmount}) as float)`.as("total_production"),
    totalConsumption: sql<number | null>`cast(sum(${electricityData.consumptionAmount}) / 1000 as float)`.as("total_consumption"),
    averagePrice: sql<number | null>`cast(avg(${electricityData.hourlyPrice}) as float)`.as("average_price"),
    longestNegativeHours: sql<number>`cast(coalesce(max(${negativeStreaks.length}), 0) as int)`.as("longest_negative_hours"),
  };
  const query = db
    .select(select)
    .from(electricityData)
    .leftJoin(
      negativeStreaks,
      and(
        eq(electricityData.date, negativeStreaks.date),
        eq(sql`extract(hour from ${electricityData.startTime})`, negativeStreaks.negativeSince),
      ),
    )
    .groupBy(electricityData.date)
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
      if (filters.minLongestNegativeHours)
        clauses.push(gte(stats.longestNegativeHours, filters.minLongestNegativeHours));
      if (filters.maxLongestNegativeHours)
        clauses.push(lte(stats.longestNegativeHours, filters.maxLongestNegativeHours));

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
      startTime: electricityData.startTime,
      productionAmount: sql<number>`cast(${electricityData.productionAmount} as float)`,
      // Convert from kWh to MWh
      consumptionAmount: sql<number>`cast(${electricityData.consumptionAmount} / 1000 as float)`,
      hourlyPrice: sql<number>`cast(${electricityData.hourlyPrice} as float)`,
    })
    .from(electricityData)
    .where(eq(sql`${electricityData.date}::text`, date))
    .orderBy((stats) => asc(stats.startTime));

  return c.json({
    date,
    data,
  });
});

export default stats;
