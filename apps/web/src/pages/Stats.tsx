import { useQuery } from "@tanstack/react-query";
import { statsOptions } from "@/queries/stats";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Pagination } from "@/components/Pagination";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

const formatNumber = (value: number) => {
  return value.toFixed(2);
};

export const Stats = () => {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ history: "push" }),
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(15).withOptions({ history: "push", clearOnDefault: false }),
  );
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsString.withDefault("date").withOptions({ history: "push", clearOnDefault: false }),
  );
  const [sortDirection, setSortDirection] = useQueryState(
    "sortDirection",
    parseAsString.withDefault("desc").withOptions({ history: "push", clearOnDefault: false }),
  );

  const { data: stats } = useQuery({
    ...statsOptions({
      sortBy,
      sortDirection,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    }),
    placeholderData: (prev) => prev,
  });

  const handleSort = (column: string) => {
    setSortBy(column);
    setSortDirection(sortBy === column && sortDirection === "asc" ? "desc" : "asc");
    setPage(1);
  };

  return (
    <div className="mx-auto my-6 max-w-6xl space-y-2 px-4">
      <h1>Electricity Statistics</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="ui-table">
          <thead>
            <tr>
              <th>
                <button className="ui-button -ml-2" onClick={() => handleSort("date")}>
                  Date
                  {sortBy === "date" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4 text-subtle/50" />
                  )}
                </button>
              </th>
              <th>
                <button className="ui-button -ml-2" onClick={() => handleSort("totalProduction")}>
                  Total Production (MWh)
                  {sortBy === "totalProduction" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4 text-subtle/50" />
                  )}
                </button>
              </th>
              <th>
                <button className="ui-button -ml-2" onClick={() => handleSort("totalConsumption")}>
                  Total Consumption (MWh)
                  {sortBy === "totalConsumption" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4 text-subtle/50" />
                  )}
                </button>
              </th>
              <th>
                <button className="ui-button -ml-2" onClick={() => handleSort("averagePrice")}>
                  Average Price (c/kWh)
                  {sortBy === "averagePrice" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4 text-subtle/50" />
                  )}
                </button>
              </th>
              <th>
                <button
                  className="ui-button -ml-2"
                  onClick={() => handleSort("longestNegativeHours")}
                >
                  Longest Negative Price Streak (hrs)
                  {sortBy === "longestNegativeHours" ? (
                    sortDirection === "asc" ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )
                  ) : (
                    <ChevronsUpDown className="size-4 text-subtle/50" />
                  )}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {stats?.data.map(
              ({ date, totalProduction, totalConsumption, averagePrice, longestNegativeHours }) => {
                return (
                  <tr key={date}>
                    <td>{date}</td>
                    <td>{totalProduction ? formatNumber(totalProduction) : "No data"}</td>
                    <td>{totalConsumption ? formatNumber(totalConsumption) : "No data"}</td>
                    <td>{averagePrice ? formatNumber(averagePrice) : "No data"}</td>
                    <td>{longestNegativeHours}</td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        total={stats?.count ?? 0}
      />
    </div>
  );
};
