import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { DailyChart } from "@/components/DailyChart";
import { InfoCard } from "@/components/InfoCard";
import { dailyStatsOptions } from "@/queries/stats";

export const Route = createFileRoute("/$date")({
  component: RouteComponent,
  errorComponent: () => "404 Not Found",
  loader: ({ context: { queryClient }, params: { date } }) => {
    return queryClient.ensureQueryData(dailyStatsOptions(date));
  },
});

function RouteComponent() {
  const { date } = Route.useParams();
  const { data: stats } = useSuspenseQuery(dailyStatsOptions(date));

  const totals = stats.data.reduce(
    (acc, hour) => {
      return {
        consumptionAmount: acc.consumptionAmount + (hour.consumptionAmount ?? 0)!,
        productionAmount: acc.productionAmount + (hour.productionAmount ?? 0)!,
      };
    },
    { consumptionAmount: 0, productionAmount: 0 },
  );

  const prices = stats.data.map((row) => row.hourlyPrice).filter((row) => row !== null);
  const averagePrice = prices.length && prices.reduce((acc, p) => acc + p) / prices.length;

  return (
    <main className="page enter gap-6">
      <div className="flex flex-wrap justify-between gap-x-8 gap-y-4 max-sm:contents">
        <div>
          <h1>Daily Report</h1>
          <p className="text-sm text-subtle">{date}</p>
        </div>

        <div className="flex flex-row justify-end gap-4 max-sm:justify-around sm:grow">
          <InfoCard label="Total Consumption" value={totals.consumptionAmount} unit="MWh" />
          <InfoCard label="Total Production" value={totals.productionAmount} unit="MWh" />
          <InfoCard label="Average Price" value={averagePrice} unit="c/kWh" />
        </div>
      </div>

      <div className="aspect-[1.8] grow text-sm max-sm:text-xs">
        <DailyChart data={stats.data} />
      </div>
    </main>
  );
}
