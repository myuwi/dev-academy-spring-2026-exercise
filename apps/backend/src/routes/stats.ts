import { zValidator } from "@hono/zod-validator";
import { and, asc, avg, count, countDistinct, eq, ilike, lt, max, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import * as z from "zod";
import { db } from "../db";
import { electricityData } from "../db/schema";
import { coalesce } from "../db/utils";

// drizzle's mapWith method drops null from nullable columns, so use a helper to keep it
const NumberNullable = (c: unknown): number | null => Number(c);

const QuerySchema = z.object({
  sortBy: z
    .enum(["date", "totalProduction", "totalConsumption", "averagePrice", "longestNegativeHours"])
    .optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).optional(),
  offset: z.coerce.number().min(0).optional(),
});

const stats = new Hono();

stats.get("/", zValidator("query", QuerySchema), async (c) => {
  const {
    limit = 50,
    offset = 0,
    sortBy = "date",
    sortDirection = "asc",
    search = "",
  } = c.req.valid("query");

  const whereClause = search ? ilike(sql`${electricityData.date}::text`, `%${search}%`) : undefined;

  const { totalCount } = (
    await db
      .select({ totalCount: countDistinct(electricityData.date) })
      .from(electricityData)
      .where(whereClause)
  )[0];

  const negativeStreaks = db
    .select({
      date: electricityData.date,
      startHour: sql<number>`
        extract(hour from ${electricityData.startTime}) - row_number() over (
          partition by ${electricityData.date}
          order by ${electricityData.startTime}
        ) + 1
      `.as("streak_start_hour"),
    })
    .from(electricityData)
    .where(lt(electricityData.hourlyPrice, "0"))
    .as("negative_streaks");

  const negativeStreakLengths = db
    .select({
      date: negativeStreaks.date,
      startHour: negativeStreaks.startHour,
      length: count().as("streak_length"),
    })
    .from(negativeStreaks)
    .groupBy(negativeStreaks.date, negativeStreaks.startHour)
    .as("negative_streak_lengths");

  const data = await db
    .select({
      date: electricityData.date,
      totalProduction: sum(electricityData.productionAmount).mapWith(NumberNullable),
      // Convert from kWh to MWh
      totalConsumption: sql`${sum(electricityData.consumptionAmount)} / 1000`.mapWith(
        NumberNullable,
      ),
      averagePrice: avg(electricityData.hourlyPrice).mapWith(NumberNullable),
      longestNegativeHours: coalesce(max(negativeStreakLengths.length), "0").mapWith(Number),
    })
    .from(electricityData)
    .where(whereClause)
    .leftJoin(
      negativeStreakLengths,
      and(
        eq(electricityData.date, negativeStreakLengths.date),
        eq(sql`extract(hour from ${electricityData.startTime})`, negativeStreakLengths.startHour),
      ),
    )
    .groupBy(electricityData.date)
    .orderBy((stats) =>
      sortDirection === "asc"
        ? sql`${stats[sortBy]} ASC NULLS FIRST`
        : sql`${stats[sortBy]} DESC NULLS LAST`,
    )
    .limit(limit)
    .offset(offset);

  return c.json({
    data,
    count: totalCount,
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
