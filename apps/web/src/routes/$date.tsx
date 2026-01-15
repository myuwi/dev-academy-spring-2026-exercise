import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DailyChart } from "@/components/DailyChart";
import { InfoCard } from "@/components/InfoCard";
import { dailyStatsOptions } from "@/queries/stats";

export const Route = createFileRoute("/$date")({
  component: RouteComponent,
});

function RouteComponent() {
  const { date } = Route.useParams();
  const { data: stats } = useQuery(dailyStatsOptions(date));

  const totals = stats?.data.reduce(
    (acc, hour) => {
      return {
        consumptionAmount: acc.consumptionAmount + (hour.consumptionAmount ?? 0)!,
        productionAmount: acc.productionAmount + (hour.productionAmount ?? 0)!,
      };
    },
    { consumptionAmount: 0, productionAmount: 0 },
  );

  const prices = stats?.data.map((row) => row.hourlyPrice).filter((row) => row !== null);
  const averagePrice = prices?.length && prices.reduce((acc, p) => acc + p) / prices.length;

  return (
    <>
      <div className="flex flex-row justify-between gap-4 max-lg:flex-col">
        <div className="mb-0">
          <h1>Daily Report</h1>
          <p className="text-sm text-subtle">{date}</p>
        </div>

        <div className="flex flex-row justify-end gap-4">
          <InfoCard label="Total Consumption" value={totals?.consumptionAmount} unit="MWh" />
          <InfoCard label="Total Production" value={totals?.productionAmount} unit="MWh" />
          <InfoCard label="Average Price" value={averagePrice} unit="c/kWh" />
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-border p-4 text-sm">
        {stats && <DailyChart data={stats.data} />}
      </div>
    </>
  );
}
