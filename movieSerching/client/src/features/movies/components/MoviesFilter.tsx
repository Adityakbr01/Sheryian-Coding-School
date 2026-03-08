import CustomSelect from "@/components/common/CustomSelect";
import { SORT_OPTIONS } from "@/constants";

interface Genre {
  id: number;
  name: string;
}

interface MoviesFilterProps {
  genres: Genre[];
  selectedGenre: string;
  onGenreChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
  year: string;
  onYearChange: (val: string) => void;
}

export default function MoviesFilter({
  genres,
  selectedGenre,
  onGenreChange,
  sortBy,
  onSortChange,
  year,
  onYearChange,
}: MoviesFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <CustomSelect
        value={selectedGenre}
        onChange={onGenreChange}
        options={[
          { label: "All Genres", value: "" },
          ...genres.map((g) => ({ label: g.name, value: g.id.toString() })),
        ]}
        placeholder="All Genres"
        className="w-40"
      />

      <CustomSelect
        value={sortBy}
        onChange={onSortChange}
        options={SORT_OPTIONS}
        placeholder="Sort By"
        className="w-48"
      />

      <CustomSelect
        value={year}
        onChange={onYearChange}
        options={[
          { label: "All Years", value: "" },
          ...Array.from({ length: 30 }, (_, i) => {
            const y = new Date().getFullYear() - i;
            return { label: y.toString(), value: y.toString() };
          }),
        ]}
        placeholder="All Years"
        className="w-32"
      />
    </div>
  );
}
