import { zValidator } from "@hono/zod-validator";
import { and, asc, avg, count, eq, gte, ilike, lt, lte, max, SQL, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import * as z from "zod";
import { db } from "../db";
import { electricityData } from "../db/schema";
import { coalesce } from "../db/utils";

const FiltersSchema = z.object({
  startDate: z.iso.date().optional(),
  endDate: z.iso.date().optional(),
  minProduction: z.coerce.number().optional(),
  maxProduction: z.coerce.number().optional(),
  minConsumption: z.coerce.number().optional(),
  maxConsumption: z.coerce.number().optional(),
  minAveragePrice: z.coerce.number().optional(),
  maxAveragePrice: z.coerce.number().optional(),
  minLongestNegativeHours: z.coerce.number().optional(),
  maxLongestNegativeHours: z.coerce.number().optional(),
});

const QuerySchema = z.object({
  sortBy: z
    .enum(["date", "totalProduction", "totalConsumption", "averagePrice", "longestNegativeHours"])
    .optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).optional(),
  offset: z.coerce.number().min(0).optional(),
  filters: z.preprocess((val: string) => JSON.parse(val), FiltersSchema).optional(),
});

const stats = new Hono();

stats.get("/", zValidator("query", QuerySchema), async (c) => {
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

  // Calculate daily aggregates
  const aggregates = db
    .select({
      date: electricityData.date,
      totalProduction: sum(electricityData.productionAmount).as("tp"),
      // Convert from kWh to MWh
      totalConsumption: sql`${sum(electricityData.consumptionAmount)} / 1000`.as("tc"),
      averagePrice: avg(electricityData.hourlyPrice).as("ap"),
      longestNegativeHours: coalesce(max(negativeStreaks.length), "0").as("lnh"),
    })
    .from(electricityData)
    .leftJoin(
      negativeStreaks,
      and(
        eq(electricityData.date, negativeStreaks.date),
        eq(sql`extract(hour from ${electricityData.startTime})`, negativeStreaks.negativeSince),
      ),
    )
    .groupBy(electricityData.date)
    .as("aggregates");

  // Compose the final columns and apply filters
  const query = db
    .select({
      date: aggregates.date,
      totalProduction: sql<number | null>`cast(${aggregates.totalProduction} as float)`.as("tp"),
      totalConsumption: sql<number | null>`cast(${aggregates.totalConsumption} as float)`.as("tc"),
      averagePrice: sql<number | null>`cast(${aggregates.averagePrice} as float)`.as("ap"),
      longestNegativeHours: sql<number>`cast(${aggregates.longestNegativeHours} as int)`.as("lnh"),
    })
    .from(aggregates)
    .where((stats) => {
      let clauses: SQL[] = [];

      // This is kind of cursed but it works :)
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
