import { useQuery } from "@tanstack/react-query";
import { createFileRoute, stripSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { Search } from "@/components/Search";
import { statsOptions } from "@/queries/stats";

const defaultValues = {
  page: 1,
  pageSize: 10,
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

  if (!stats) return null;

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
    <div className="enter space-y-2">
      <h1 className="mb-4">Electricity Statistics</h1>

      <div>
        <Search value={query} onChange={handleSearch} />
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <DataTable
          data={stats?.data ?? []}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      <Pagination
        page={page}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        total={stats?.count ?? 0}
      />
    </div>
  );
}
