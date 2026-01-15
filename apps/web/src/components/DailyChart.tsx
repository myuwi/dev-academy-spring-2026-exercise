import { CartesianGrid, Line, XAxis, YAxis, Legend, Tooltip, LineChart } from "recharts";
import type { HourlyStat } from "@/queries/stats";
import { formatTime } from "@/utils";
import { CustomTooltip } from "./CustomTooltip";

const renderLegendText = (value: React.ReactNode) => {
  return <span className="ml-0.5 text-sm text-primary select-none">{value}</span>;
};

interface DailyChartProps {
  data: HourlyStat[];
}

// TODO: Align y axes at 0 units
// TODO: Fix x axis at 0-23 hours

export const DailyChart = ({ data }: DailyChartProps) => {
  const minPrice = data.reduce<number>((min, d) => {
    if (d.hourlyPrice && d.hourlyPrice < min) {
      return d.hourlyPrice;
    }
    return min;
  }, 0);

  return (
    <LineChart className="aspect-[1.8] w-full" responsive data={data}>
      <CartesianGrid yAxisId="left" vertical={false} strokeDasharray="3" stroke="#ccc" />
      <Line
        yAxisId="left"
        type="monotone"
        stroke="var(--color-blue-500)"
        strokeWidth={3}
        dot={false}
        dataKey="productionAmount"
        name="Production"
        unit=" MWh"
      />
      <Line
        yAxisId="left"
        type="monotone"
        stroke="var(--color-primary)"
        strokeWidth={3}
        dot={false}
        dataKey="consumptionAmount"
        name="Consumption"
        unit=" MWh"
      />
      <Line
        yAxisId="right"
        type="monotone"
        stroke="var(--color-orange-400)"
        strokeWidth={3}
        dot={false}
        dataKey="hourlyPrice"
        name="Price"
        unit=" c/kWh"
      />

      <XAxis
        dataKey="startTime"
        axisLine={false}
        tickLine={false}
        tickMargin={0}
        tickFormatter={formatTime}
        minTickGap={10}
      />
      <YAxis
        type="number"
        yAxisId="left"
        width="auto"
        axisLine={false}
        tickLine={false}
        tickCount={6}
        domain={[minPrice, "auto"]}
        unit=" MWh"
      />
      <YAxis
        type="number"
        yAxisId="right"
        width="auto"
        orientation="right"
        axisLine={false}
        tickLine={false}
        tickCount={6}
        domain={[minPrice, "auto"]}
        unit=" c/kWh"
      />
      <Legend
        height={40}
        iconSize={10}
        align="right"
        verticalAlign="top"
        iconType="square"
        formatter={renderLegendText}
      />
      <Tooltip isAnimationActive={false} content={CustomTooltip} />
    </LineChart>
  );
};
