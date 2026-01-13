import { db } from "../../src/db";
import { electricityData } from "../../src/db/schema";

type InsertRow = typeof electricityData.$inferInsert;

export const seedElectricityData = async () => {
  const baseDate = new Date("2025-12-29T00:00:00Z");
  const rows: InsertRow[] = [];

  // 7 days
  for (let d = 0; d < 7; d++) {
    // 24 hours
    for (let h = 0; h < 24; h++) {
      const startTime = new Date(baseDate);
      startTime.setHours(h, 0, 0, 0);

      let price = 5;

      // day 2 with 5-hour and 3-hour negative price streak
      if (d === 1 && ((h >= 5 && h <= 9) || (h >= 12 && h <= 14))) price = -10;

      // day 3 with alternating positive/negative prices
      if (d === 2 && h % 2 === 0) price = -5;

      // day 4 with no consumption data
      const consumptionAmount = d !== 3 ? "4000000" : null;

      rows.push({
        id: d * 24 + h + 1,
        date: startTime.toISOString().slice(0, 10), // "YYYY-MM-DD"
        startTime: startTime.toISOString(),
        productionAmount: "30000", // MWh
        consumptionAmount, // kWh
        hourlyPrice: price.toString(),
      });
    }

    baseDate.setUTCDate(baseDate.getUTCDate() + 1);
  }

  await db.insert(electricityData).values(rows);
  return rows;
};
