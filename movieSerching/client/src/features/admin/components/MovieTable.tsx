import { HiPencil, HiTrash } from "react-icons/hi";
import type { CustomMovie } from "@/types";

interface MovieTableProps {
  movies: CustomMovie[];
  onEdit: (movie: CustomMovie) => void;
  onDelete: (id: string) => void;
}

export default function MovieTable({
  movies,
  onEdit,
  onDelete,
}: MovieTableProps) {
  if (movies.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No custom movies yet. Click "Add Movie" to create one.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
              Poster
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
              Title
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
              Category
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
              Genres
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
              Rating
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
              Release Date
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr
              key={movie._id}
              className="border-b border-border hover:bg-muted/30 transition-colors"
            >
              <td className="py-3 px-4">
                {movie.posterUrl ? (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-10 h-14 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-10 h-14 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">
                    N/A
                  </div>
                )}
              </td>
              <td className="py-3 px-4 text-sm font-medium text-foreground max-w-[200px] truncate">
                {movie.title}
              </td>
              <td className="py-3 px-4">
                <span className="text-xs bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full capitalize">
                  {movie.category}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1 max-w-[160px]">
                  {(movie.genre || []).slice(0, 2).map((g) => (
                    <span
                      key={g}
                      className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                    >
                      {g}
                    </span>
                  ))}
                  {(movie.genre || []).length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{(movie.genre || []).length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {movie.rating?.toFixed(1) || "N/A"}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {movie.releaseDate
                  ? new Date(movie.releaseDate).toLocaleDateString()
                  : "N/A"}
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(movie)}
                    className="p-1.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <HiPencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(movie._id)}
                    className="p-1.5 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <HiTrash size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
