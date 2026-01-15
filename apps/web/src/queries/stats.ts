import { queryOptions } from "@tanstack/react-query";
import ky from "ky";

export interface DailyStat {
  date: string;
  totalProduction: number | null;
  totalConsumption: number | null;
  averagePrice: number | null;
  longestNegativeHours: number;
}

export interface HourlyStat {
  startTime: string;
  productionAmount: number | null;
  consumptionAmount: number | null;
  hourlyPrice: number | null;
}

type StatsOptionsParams = {
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  search?: string;
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
        .json<{ data: DailyStat[]; count: number }>(),
  });

export const dailyStatsOptions = (date: string) =>
  queryOptions({
    queryKey: ["stats", date],
    queryFn: () =>
      ky.get(`/api/stats/${date}`).json<{
        date: string;
        data: HourlyStat[];
      }>(),
  });
