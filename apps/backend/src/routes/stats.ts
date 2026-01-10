import { avg, desc, sum } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { electricityData } from "../db/schema";

const router = new Hono();

// drizzle's mapWith method drops null from nullable columns, so use a helper to keep it
const NumberNullable = (c: unknown): number | null => Number(c);

router.get("/", async (c) => {
  const data = await db
    .select({
      date: electricityData.date,
      totalProduction: sum(electricityData.productionAmount).mapWith(NumberNullable),
      totalConsumption: sum(electricityData.consumptionAmount).mapWith(NumberNullable),
      averagePrice: avg(electricityData.hourlyPrice).mapWith(NumberNullable),
      // TODO: Longest consecutive time in hours, when electricity price has been negative for the day
    })
    .from(electricityData)
    .groupBy(electricityData.date)
    .orderBy(desc(electricityData.date))
    .limit(50)
    .offset(0);

  return c.json(data);
});

export default router;
