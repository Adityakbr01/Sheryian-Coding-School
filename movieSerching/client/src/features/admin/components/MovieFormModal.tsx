import { HiX } from "react-icons/hi";
import type { CustomMovie } from "@/types";

type FormData = {
  title: string;
  posterUrl: string;
  backdropUrl: string;
  description: string;
  releaseDate: string;
  trailerUrl: string;
  genre: string;
  category: "movie" | "tv" | "both";
  rating: string;
  tmdbId?: string;
};

interface MovieFormModalProps {
  form: FormData;
  editingId: string | null;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  onAutoFill?: () => void;
  isAutoFilling?: boolean;
}

export default function MovieFormModal({
  form,
  editingId,
  onClose,
  onSubmit,
  onChange,
  onAutoFill,
  isAutoFilling = false,
}: MovieFormModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {editingId ? "Edit Movie" : "Add Movie"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <HiX size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* TMDB Auto-fill Section */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50 mb-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-1 flex items-center gap-1">
                  TMDB ID{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </label>
                <input
                  name="tmdbId"
                  type="number"
                  value={form.tmdbId || ""}
                  onChange={onChange}
                  className="input-field bg-background"
                  placeholder="e.g. 293660"
                />
              </div>
              {onAutoFill && (
                <button
                  type="button"
                  onClick={onAutoFill}
                  disabled={
                    !form.tmdbId ||
                    !form.category ||
                    form.category === "both" ||
                    isAutoFilling
                  }
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap h-[42px]"
                >
                  {isAutoFilling ? "Fetching..." : "Auto-fill from TMDB"}
                </button>
              )}
            </div>
            {form.category === "both" && (
              <p className="text-xs text-amber-500 mt-2">
                * Auto-fill requires category to be specifically 'Movie' or 'TV
                Show'
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Title *
            </label>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={3}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Poster URL
              </label>
              <input
                name="posterUrl"
                value={form.posterUrl}
                onChange={onChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Backdrop URL
              </label>
              <input
                name="backdropUrl"
                value={form.backdropUrl}
                onChange={onChange}
                className="input-field"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Release Date
              </label>
              <input
                type="date"
                name="releaseDate"
                value={form.releaseDate}
                onChange={onChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="input-field"
              >
                <option value="movie">Movie</option>
                <option value="tv">TV Show</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Trailer URL
            </label>
            <input
              name="trailerUrl"
              value={form.trailerUrl}
              onChange={onChange}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Genres (comma separated)
              </label>
              <input
                name="genre"
                value={form.genre}
                onChange={onChange}
                className="input-field"
                placeholder="Action, Drama"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Rating (0-10)
              </label>
              <input
                name="rating"
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={form.rating}
                onChange={onChange}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full cursor-pointer">
            {editingId ? "Update Movie" : "Create Movie"}
          </button>
        </form>
      </div>
    </div>
  );
}
