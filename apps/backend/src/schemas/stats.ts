import z from "zod";

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

export const GetStatsQuerySchema = z.object({
  sortBy: z
    .enum(["date", "totalProduction", "totalConsumption", "averagePrice", "longestNegativeHours"])
    .optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(500).optional(),
  offset: z.coerce.number().min(0).optional(),
  filters: z.preprocess((val: string) => JSON.parse(val), FiltersSchema).optional(),
});
