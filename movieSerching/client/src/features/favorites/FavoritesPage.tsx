import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiHeart, HiTrash } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { fetchFavorites, removeFavorite } from "@/store/slices/favoriteSlice";
import { getImageUrl, formatDate } from "@/lib/utils";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isLoading } = useAppSelector((state) => state.favorites);

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  const handleRemove = async (id: string) => {
    await dispatch(removeFavorite(id));
    toast.success("Removed from favorites");
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <HiArrowLeft size={20} />
        </button>
        <HiHeart className="text-[var(--custom-accentColor)] text-3xl" />
        <h1 className="text-3xl md:text-5xl font-juana tracking-wide text-foreground">
          My Favorites
        </h1>
        <span className="text-sm text-muted-foreground">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <HiHeart className="mx-auto text-6xl text-muted-foreground/30 mb-4" />
          <p className="text-foreground/80 text-lg">No favorites yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Start adding movies and shows to your favorites!
          </p>
          <Link to="/movies" className="btn-primary inline-block mt-4">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item._id} className="group relative">
              <Link
                to={`/${item.mediaType}/${item.tmdbId || ""}`}
                className="block"
              >
                <div className="card-hover relative overflow-hidden rounded-xl bg-card border border-white/5">
                  <div className="aspect-[2/3] overflow-hidden">
                    <img
                      src={getImageUrl(item.posterUrl)}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold font-NeuMachina text-foreground truncate group-hover:text-[var(--custom-primary)] transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-HelveticaNow text-muted-foreground">
                        {item.releaseDate
                          ? new Date(item.releaseDate).getFullYear()
                          : "N/A"}
                      </span>
                      <span className="text-[10px] font-bold bg-[var(--custom-primary)]/80 text-black px-2 py-0.5 rounded-full uppercase shadow-sm">
                        {item.mediaType}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleRemove(item._id)}
                className="absolute top-2 right-2 p-2 bg-red-600/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-600"
              >
                <HiTrash className="text-foreground text-sm" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
