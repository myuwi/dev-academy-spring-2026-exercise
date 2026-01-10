import { and, avg, count, desc, eq, lt, max, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { electricityData } from "../db/schema";
import { coalesce } from "../db/utils";

const stats = new Hono();

// drizzle's mapWith method drops null from nullable columns, so use a helper to keep it
const NumberNullable = (c: unknown): number | null => Number(c);

stats.get("/", async (c) => {
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
      totalConsumption: sum(electricityData.consumptionAmount).mapWith(NumberNullable),
      averagePrice: avg(electricityData.hourlyPrice).mapWith(NumberNullable),
      longestNegativeHours: coalesce(max(negativeStreakLengths.length), "0").mapWith(Number),
    })
    .from(electricityData)
    .leftJoin(
      negativeStreakLengths,
      and(
        eq(electricityData.date, negativeStreakLengths.date),
        eq(sql`extract(hour from ${electricityData.startTime})`, negativeStreakLengths.startHour),
      ),
    )
    .groupBy(electricityData.date)
    .orderBy(desc(electricityData.date))
    .limit(50)
    .offset(0);

  return c.json(data);
});

export default stats;
