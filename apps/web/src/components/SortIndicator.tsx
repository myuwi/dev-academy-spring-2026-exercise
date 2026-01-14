import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";

interface SortIndicatorProps {
  active: boolean;
  direction: "asc" | "desc";
}

export const SortIndicator = ({ active, direction }: SortIndicatorProps) => {
  if (!active) {
    return <ChevronsUpDown className="size-4 text-subtle/50" />;
  }
  if (direction === "asc") {
    return <ChevronUp className="size-4" aria-label="Ascending" />;
  } else {
    return <ChevronDown className="size-4" aria-label="Descending" />;
  }
};
