import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowLeft, HiPlus, HiPencil, HiTrash, HiX } from "react-icons/hi";
import { adminService } from "@/services/adminService";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import type { CustomMovie } from "@/types";

const emptyForm = {
  title: "",
  posterUrl: "",
  backdropUrl: "",
  description: "",
  releaseDate: "",
  trailerUrl: "",
  genre: "",
  category: "movie" as "movie" | "tv" | "both",
  rating: "",
};

export default function AdminMovies() {
  const [movies, setMovies] = useState<CustomMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchMovies = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllMovies();
      setMovies(data);
    } catch {
      toast.error("Failed to fetch movies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      toast.error("Title and description are required");
      return;
    }

    const payload = {
      title: form.title,
      posterUrl: form.posterUrl,
      backdropUrl: form.backdropUrl,
      description: form.description,
      releaseDate: form.releaseDate,
      trailerUrl: form.trailerUrl,
      genre: form.genre
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      category: form.category,
      rating: form.rating ? Number(form.rating) : undefined,
    };

    try {
      if (editingId) {
        await adminService.updateMovie(editingId, payload);
        toast.success("Movie updated");
      } else {
        await adminService.createMovie(payload);
        toast.success("Movie created");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchMovies();
    } catch {
      toast.error("Action failed");
    }
  };

  const handleEdit = (movie: CustomMovie) => {
    setForm({
      title: movie.title,
      posterUrl: movie.posterUrl || "",
      backdropUrl: movie.backdropUrl || "",
      description: movie.description,
      releaseDate: movie.releaseDate?.split("T")[0] || "",
      trailerUrl: movie.trailerUrl || "",
      genre: movie.genre?.join(", ") || "",
      category: movie.category,
      rating: movie.rating?.toString() || "",
    });
    setEditingId(movie._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this movie?")) return;
    try {
      await adminService.deleteMovie(id);
      toast.success("Movie deleted");
      setMovies(movies.filter((m) => m._id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <HiArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Manage Movies</h1>
        </div>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2 cursor-pointer"
        >
          <HiPlus /> Add Movie
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="bg-card border border-border rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {editingId ? "Edit Movie" : "Add Movie"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <HiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Title *
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
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
                  onChange={handleChange}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">
                {editingId ? "Update Movie" : "Create Movie"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Movie Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
                Title
              </th>
              <th className="py-3 px-4 text-sm font-semibold text-muted-foreground">
                Category
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
                <td className="py-3 px-4 text-sm text-foreground">
                  {movie.title}
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
                    {movie.category}
                  </span>
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
                      onClick={() => handleEdit(movie)}
                      className="p-1.5 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25 transition-colors cursor-pointer"
                    >
                      <HiPencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(movie._id)}
                      className="p-1.5 rounded-lg bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25 transition-colors cursor-pointer"
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

      {movies.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          No custom movies yet. Click "Add Movie" to create one.
        </p>
      )}
    </div>
  );
}
