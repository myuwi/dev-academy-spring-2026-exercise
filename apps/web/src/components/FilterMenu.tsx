import { Popover } from "@base-ui/react/popover";
import { Calendar, ChevronDown, Filter } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "@/hooks/useForm";

const isoDatePattern = "\\d{4}-([0][1-9]|1[0-2])-([0][1-9]|[1-2]\\d|3[01])";
const numberPattern = "-?\\d+(.\\d+)?";
const posIntPattern = "\\d+";

// TODO: I should use react-hook-form and zod here to validate and give good errors but no time :)
// TODO: Use a proper datepicker for selecting dates
// TODO: Render filter menu as a bottom sheet on mobile sizes

export type FilterValues = {
  startDate?: string;
  endDate?: string;
  minProduction?: string;
  maxProduction?: string;
  minConsumption?: string;
  maxConsumption?: string;
  minAveragePrice?: string;
  maxAveragePrice?: string;
  minLongestNegativePriceHours?: string;
  maxLongestNegativePriceHours?: string;
};

export interface FilterMenuProps {
  values: FilterValues;
  onChange?: (values: FilterValues) => void;
}

export const FilterMenu = ({ values: activeValues, onChange }: FilterMenuProps) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);

  const numActiveFilters = Object.values(activeValues).length;

  const handleOpen = () => setOpen(true);
  const handleOpenChange = (isOpen: boolean) => setOpen(isOpen);

  const { setValues, register, handleSubmit } = useForm({ defaultValues: activeValues });

  const onSubmit = (values: FilterValues) => onChange?.(values);

  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Use same object to maintain reference equality with inner and outer state
    const empty = {};
    setValues(empty);
    onChange?.(empty);
  };

  const content = (
    <form className="contents" onSubmit={handleSubmit(onSubmit)} onReset={handleReset}>
      <fieldset className="ui-fieldset">
        <legend>Date</legend>
        <div className="flex items-center gap-1">
          <div className="ui-input">
            <input placeholder="Start Date" {...register("startDate")} pattern={isoDatePattern} />
            <Calendar className="size-4" />
          </div>
          -
          <div className="ui-input">
            <input placeholder="End Date" {...register("endDate")} pattern={isoDatePattern} />
            <Calendar className="size-4" />
          </div>
        </div>
      </fieldset>
      <fieldset className="ui-fieldset">
        <legend>Production Amount</legend>
        <div className="flex items-center gap-1">
          <input
            className="ui-input"
            {...register("minProduction")}
            placeholder="Minimum"
            pattern={numberPattern}
          />
          -
          <input
            className="ui-input"
            {...register("maxProduction")}
            placeholder="Maximum"
            pattern={numberPattern}
          />
        </div>
      </fieldset>
      <fieldset className="ui-fieldset">
        <legend>Consumption Amount</legend>
        <div className="flex items-center gap-1">
          <input
            className="ui-input"
            {...register("minConsumption")}
            placeholder="Minimum"
            pattern={numberPattern}
          />
          -
          <input
            className="ui-input"
            {...register("maxConsumption")}
            placeholder="Maximum"
            pattern={numberPattern}
          />
        </div>
      </fieldset>
      <fieldset className="ui-fieldset">
        <legend>Average Price</legend>
        <div className="flex items-center gap-1">
          <input
            className="ui-input"
            {...register("minAveragePrice")}
            placeholder="Minimum"
            pattern={numberPattern}
          />
          -
          <input
            className="ui-input"
            {...register("maxAveragePrice")}
            placeholder="Maximum"
            pattern={numberPattern}
          />
        </div>
      </fieldset>
      <fieldset className="ui-fieldset">
        <legend>Longest Negative Price Streak</legend>
        <div className="flex items-center gap-1">
          <input
            className="ui-input"
            {...register("minLongestNegativePriceHours")}
            placeholder="Minimum"
            pattern={posIntPattern}
          />
          -
          <input
            className="ui-input"
            {...register("maxLongestNegativePriceHours")}
            placeholder="Maximum"
            pattern={posIntPattern}
          />
        </div>
      </fieldset>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="ui-button" type="reset">
          Reset
        </button>
        <button className="ui-button bg-primary text-primary-foreground" type="submit">
          Apply
        </button>
      </div>
    </form>
  );

  return (
    <>
      <button
        className="ui-button group gap-2 ring ring-border data-[popover-open=true]:bg-secondary"
        onClick={handleOpen}
        data-popover-open={open}
        ref={triggerRef}
        aria-label={`${numActiveFilters} active filter(s)`}
      >
        <Filter className="size-4" />
        Filters
        {numActiveFilters > 0 && (
          <div className="size-4 rounded-full bg-primary text-center text-xs text-primary-foreground">
            {numActiveFilters}
          </div>
        )}
        <ChevronDown className="size-4 group-data-[popover-open=true]:rotate-180" />
      </button>

      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Portal>
          <Popover.Positioner anchor={triggerRef} sideOffset={8} align="end">
            <Popover.Popup className="ui-card z-50 w-84 origin-(--transform-origin) shadow-md transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0">
              <Popover.Title className="mb-2 text-subtle">Filter</Popover.Title>
              <div className="flex flex-col gap-2">{content}</div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
    </>
  );
};
