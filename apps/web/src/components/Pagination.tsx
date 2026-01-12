import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface PaginationProps {
  page: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  total: number;
}

const pageSizes = [10, 15, 20, 25, 30, 40, 50];

export const Pagination = ({
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
  total,
}: PaginationProps) => {
  const maxPage = Math.max(Math.ceil(total / pageSize), 1);
  const hasPrevious = page > 1;
  const hasNext = page < maxPage;

  const [value, setValue] = useState<string>(page.toString());
  const valid = !isNaN(Number(value)) && Number(value) > 0 && Number(value) <= maxPage;

  useEffect(() => {
    setValue(page.toString());
  }, [page]);

  const goPrevious = () => onPageChange(page - 1);
  const goNext = () => onPageChange(page + 1);

  const handlePageChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (valid) {
      onPageChange(Number(value));
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(Number(e.target.value));
    onPageChange(1);
  };

  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <div>
        Showing {(page - 1) * pageSize + 1}-{page * pageSize} of {total}
      </div>

      <div className="flex gap-2">
        <div className="flex">
          <button className="ui-button" onClick={goPrevious} disabled={!hasPrevious}>
            <ChevronLeft />
          </button>
        </div>
        <form onSubmit={handlePageChange}>
          <input
            className="ui-input w-11 text-center"
            inputMode="numeric"
            aria-invalid={!valid}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />{" "}
          of {maxPage}
        </form>
        <div className="flex">
          <button className="ui-button" onClick={goNext} disabled={!hasNext}>
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        Show per page:
        <select className="ui-select" value={pageSize} onChange={handlePageSizeChange}>
          {pageSizes.map((s) => {
            return (
              <option key={s} value={s}>
                {s}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};
