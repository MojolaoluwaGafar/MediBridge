import { Search } from "lucide-react";

export type FilterOption = { value: string; label: string };

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  filter: string;
  onFilterChange: (value: string) => void;
  filterOptions: FilterOption[];
};

// The "Search" + "Filter" card at the top of list pages (Departments, Medical Records).
export default function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  filter,
  onFilterChange,
  filterOptions,
}: Props) {
  return (
    <div className="my-5 flex w-full flex-col gap-4 rounded-xl border border-[#E6E3E3] bg-white p-4 sm:flex-row sm:items-end sm:gap-5 sm:p-5">
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
        Search
        <span className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            color="#605E5E"
            size={18}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-[#E7E4E4] pl-10 pr-4 text-sm focus:border-[#28574E] focus:outline-none"
          />
        </span>
      </label>

      <label className="flex flex-col gap-1 text-sm sm:w-48">
        Filter
        <select
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="h-10 w-full rounded-md border border-[#E6E3E3] bg-white px-2 focus:border-[#28574E] focus:outline-none"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
