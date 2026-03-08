import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { adminService } from "@/services/adminService";
import { movieService } from "@/services/movieService";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import type { CustomMovie } from "@/types";
import MovieFormModal from "../components/MovieFormModal";
import MovieTable from "../components/MovieTable";
import { getImageUrl } from "@/lib/utils";

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
  tmdbId: "",
};

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<CustomMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

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

  const handleAutoFill = async () => {
    if (!form.tmdbId || !form.category || form.category === "both") return;

    try {
      setIsAutoFilling(true);
      const detail = await movieService.getDetail(
        Number(form.tmdbId),
        form.category,
      );

      let newTitle = detail.title || detail.name || "";
      let newDate = detail.release_date || detail.first_air_date || "";

      setForm((prev) => ({
        ...prev,
        title: newTitle,
        description: detail.overview || "",
        posterUrl: detail.poster_path
          ? getImageUrl(detail.poster_path, "w500")
          : "",
        backdropUrl: detail.backdrop_path
          ? getImageUrl(detail.backdrop_path, "original")
          : "",
        releaseDate: newDate,
        rating: detail.vote_average ? detail.vote_average.toFixed(1) : "",
        genre: detail.genres ? detail.genres.map((g) => g.name).join(", ") : "",
      }));
      toast.success("Movie details auto-filled successfully!");
    } catch (err) {
      toast.error(
        "Failed to auto-fill. Please check if the TMDB ID is correct for this category.",
      );
      console.error(err);
    } finally {
      setIsAutoFilling(false);
    }
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
      tmdbId: form.tmdbId ? Number(form.tmdbId) : undefined,
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
      tmdbId: movie.tmdbId?.toString() || "",
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Manage Movies
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {movies.length} custom {movies.length === 1 ? "entry" : "entries"}
            </p>
          </div>
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

      {showForm && (
        <MovieFormModal
          form={form}
          editingId={editingId}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
          onChange={handleChange}
          onAutoFill={handleAutoFill}
          isAutoFilling={isAutoFilling}
        />
      )}

      <MovieTable movies={movies} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
