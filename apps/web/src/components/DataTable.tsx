import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import type { DailyStat } from "@/queries/stats";
import { formatNumber } from "@/utils";
import { SortIndicator } from "./SortIndicator";

interface DataTableProps {
  data: DailyStat[];
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSort: (sortBy: string) => void;
}

// NOTE: Use tanstack table for table state if something more robust is needed
export const DataTable = ({ data, sortBy, sortDirection, onSort }: DataTableProps) => {
  return (
    <table className="ui-table" aria-label="Data Table">
      <thead>
        <tr>
          <th>
            <button className="ui-button -ml-2" onClick={() => onSort("date")}>
              Date
              <SortIndicator active={sortBy === "date"} direction={sortDirection} />
            </button>
          </th>
          <th>
            <button className="ui-button -ml-2" onClick={() => onSort("totalProduction")}>
              Total Production (MWh)
              <SortIndicator active={sortBy === "totalProduction"} direction={sortDirection} />
            </button>
          </th>
          <th>
            <button className="ui-button -ml-2" onClick={() => onSort("totalConsumption")}>
              Total Consumption (MWh)
              <SortIndicator active={sortBy === "totalConsumption"} direction={sortDirection} />
            </button>
          </th>
          <th>
            <button className="ui-button -ml-2" onClick={() => onSort("averagePrice")}>
              Average Price (c/kWh)
              <SortIndicator active={sortBy === "averagePrice"} direction={sortDirection} />
            </button>
          </th>
          <th>
            <button className="ui-button -ml-2" onClick={() => onSort("longestNegativeHours")}>
              Longest Negative Price Streak (hrs)
              <SortIndicator active={sortBy === "longestNegativeHours"} direction={sortDirection} />
            </button>
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {data.map(
          ({ date, totalProduction, totalConsumption, averagePrice, longestNegativeHours }) => {
            return (
              <tr key={date}>
                <td>{date}</td>
                <td>{totalProduction ? formatNumber(totalProduction) : "No data"}</td>
                <td>{totalConsumption ? formatNumber(totalConsumption) : "No data"}</td>
                <td>{averagePrice ? formatNumber(averagePrice) : "No data"}</td>
                <td>{longestNegativeHours}</td>
                <td>
                  <Link className="ui-button size-9 ring ring-border" to="/$date" params={{ date }}>
                    <ChevronRight />
                  </Link>
                </td>
              </tr>
            );
          },
        )}
      </tbody>
    </table>
  );
};
