import { useQuery } from "@tanstack/react-query";
import { statsOptions } from "@/queries/stats";
import { parseAsInteger, useQueryState } from "nuqs";
import { Pagination } from "@/components/Pagination";

export const Stats = () => {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ history: "push" }),
  );
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(15).withOptions({ history: "push" }),
  );

  const { data: stats } = useQuery({
    ...statsOptions({
      offset: (page - 1) * pageSize,
      limit: pageSize,
    }),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="mx-auto my-6 max-w-6xl space-y-2 px-4">
      <h1>Electricity Statistics</h1>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Total Production</th>
              <th>Total Consumption</th>
              <th>Average Price</th>
              <th>Longest Negative Hours</th>
            </tr>
          </thead>
          <tbody>
            {stats?.data.map(
              ({ date, totalProduction, totalConsumption, averagePrice, longestNegativeHours }) => {
                return (
                  <tr key={date}>
                    <td>{date}</td>
                    <td>{totalProduction ?? "No data"}</td>
                    <td>{totalConsumption ?? "No data"}</td>
                    <td>{averagePrice ?? "No data"}</td>
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
