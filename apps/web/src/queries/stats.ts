import { queryOptions } from "@tanstack/react-query";
import ky from "ky";

interface Stat {
  date: string;
  totalProduction: number | null;
  totalConsumption: number | null;
  averagePrice: number | null;
  longestNegativeHours: number;
}

type StatsOptionsParams = {
  sortBy?: string;
  sortDirection?: string;
  offset?: number;
  limit?: number;
};

export const statsOptions = (params?: StatsOptionsParams) =>
  queryOptions({
    queryKey: ["stats", params],
    queryFn: () =>
      ky
        .get("/api/stats", {
          searchParams: params,
        })
        .json<{ data: Stat[]; count: number }>(),
  });
