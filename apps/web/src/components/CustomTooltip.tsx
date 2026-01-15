import type { Tooltip } from "recharts";
import { formatNumber, formatTime } from "@/utils";

export const CustomTooltip: React.ComponentProps<typeof Tooltip>["content"] = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="flex flex-col rounded-lg border border-border bg-background py-2 pr-3 pl-2 text-sm">
        <p className="text-foreground font-medium">{formatTime(label as string)}</p>
        {payload.map((item) => {
          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-sm" style={{ backgroundColor: item.color }}></div>
                <p className="text-subtle">{item.name}</p>
              </div>
              <p>
                {formatNumber(item.value)} {item.unit}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};
