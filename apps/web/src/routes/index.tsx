import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { ChevronRight } from "lucide-react";
import { z } from "zod";
import { Pagination } from "@/components/Pagination";
import { Search } from "@/components/Search";
import { SortIndicator } from "@/components/SortIndicator";
import { statsOptions } from "@/queries/stats";
import { formatNumber } from "@/utils";

const defaultValues = {
  page: 1,
  pageSize: 15,
  sortBy: "date",
  sortDirection: "desc",
  q: "",
} as const;

const statsSearchSchema = z.object({
  page: z.number().default(defaultValues.page),
  pageSize: z.number().default(defaultValues.pageSize),
  sortBy: z.string().default(defaultValues.sortBy),
  sortDirection: z.enum(["asc", "desc"]).default(defaultValues.sortDirection),
  q: z.string().default(defaultValues.q),
});

export const Route = createFileRoute("/")({
  component: RouteComponent,
  validateSearch: zodValidator(statsSearchSchema),
  search: {
    middlewares: [stripSearchParams(defaultValues)],
  },
});

function RouteComponent() {
  const { page, pageSize, sortBy, sortDirection, q: query } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: stats } = useQuery({
    ...statsOptions({
      sortBy,
      sortDirection,
      search: query || undefined,
      offset: (page - 1) * pageSize,
      limit: pageSize,
    }),
    placeholderData: (prev) => prev,
  });

  const handleSort = (column: string) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        sortBy: column,
        sortDirection: sortBy === column && sortDirection === "desc" ? "asc" : "desc",
        page: 1,
      }),
    });
  };

  const handleSearch = (query: string) => {
    void navigate({
      search: (prev) => ({ ...prev, q: query, page: 1 }),
    });
  };

  const handlePageChange = (page: number) => {
    void navigate({
      search: (prev) => ({ ...prev, page }),
    });
  };

  const handlePageSizeChange = (pageSize: number) => {
    void navigate({
      search: (prev) => ({ ...prev, pageSize }),
    });
  };

  return (
    <>
      <h1 className="mb-4">Electricity Statistics</h1>

      <div>
        <Search value={query} onChange={handleSearch} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="ui-table" aria-label="Data Table">
          <thead>
            <tr>
              <th>
                <button className="ui-button -ml-2" onClick={() => handleSort("date")}>
                  Date
                  <SortIndicator active={sortBy === "date"} direction={sortDirection} />
                </button>
              </th>
              <th>
                <button className="ui-button -ml-2" onClick={() => handleSort("totalProduction")}>
                  Total Production (MWh)
                  <SortIndicator active={sortBy === "totalProduction"} direction={sortDirection} />
                </button>
              </th>
              <th>
                <button className="ui-button -ml-2" onClick={() => handleSort("totalConsumption")}>
                  Total Consumption (MWh)
                  <SortIndicator active={sortBy === "totalConsumption"} direction={sortDirection} />
                </button>
              </th>
              <th>
                <button className="ui-button -ml-2" onClick={() => handleSort("averagePrice")}>
                  Average Price (c/kWh)
                  <SortIndicator active={sortBy === "averagePrice"} direction={sortDirection} />
                </button>
              </th>
              <th>
                <button
                  className="ui-button -ml-2"
                  onClick={() => handleSort("longestNegativeHours")}
                >
                  Longest Negative Price Streak (hrs)
                  <SortIndicator
                    active={sortBy === "longestNegativeHours"}
                    direction={sortDirection}
                  />
                </button>
              </th>
              <th></th>
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
                    <td>
                      <Link
                        className="ui-button -ml-2 size-9 ring ring-border"
                        to="/$date"
                        params={{ date }}
                      >
                        <ChevronRight />
                      </Link>
                    </td>
                  </tr>
                );
              },
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        total={stats?.count ?? 0}
      />
    </>
  );
}
