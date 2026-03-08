import CustomSelect from "@/components/common/CustomSelect";

const SORT_OPTIONS = [
  { label: "Popularity", value: "popularity.desc" },
  { label: "Rating", value: "vote_average.desc" },
  { label: "First Air Date", value: "first_air_date.desc" },
];

interface Genre {
  id: number;
  name: string;
}

interface TVFilterProps {
  genres: Genre[];
  selectedGenre: string;
  onGenreChange: (val: string) => void;
  sortBy: string;
  onSortChange: (val: string) => void;
}

export default function TVFilter({
  genres,
  selectedGenre,
  onGenreChange,
  sortBy,
  onSortChange,
}: TVFilterProps) {
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
    </div>
  );
}
