import { SearchIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const Search = ({ value: valueProp, onChange }: SearchProps) => {
  const [value, setValue] = useState(valueProp);
  useEffect(() => {
    setValue(valueProp);
  }, [valueProp]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onChange(value);
  };

  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setValue("");
    onChange("");
  };

  return (
    <form className="contents" onSubmit={handleSubmit} onReset={handleReset}>
      <label className="ui-input w-full md:max-w-sm" role="search" aria-label="Search bar">
        <SearchIcon className="size-4 opacity-50" />
        <input
          placeholder="Search by date"
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        {!!value && (
          <button
            className="opacity-50 transition-opacity hover:opacity-75"
            type="reset"
            aria-label="Clear Search"
          >
            <X className="size-4" />
          </button>
        )}
      </label>
    </form>
  );
};
