import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiClock, HiTrash } from "react-icons/hi";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import {
  fetchWatchHistory,
  clearHistory,
} from "@/store/slices/watchHistorySlice";
import { getImageUrl } from "@/lib/utils";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";

export default function WatchHistoryPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, isLoading } = useAppSelector((state) => state.watchHistory);

  useEffect(() => {
    dispatch(fetchWatchHistory());
  }, [dispatch]);

  const handleClear = async () => {
    if (confirm("Clear all watch history?")) {
      await dispatch(clearHistory());
      toast.success("Watch history cleared");
    }
  };

  if (isLoading) return <Loader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <HiArrowLeft size={20} />
          </button>
          <HiClock className="text-[var(--custom-primary)] text-3xl" />
          <h1 className="text-3xl md:text-5xl font-juana tracking-wide text-foreground">
            Watch History
          </h1>
          <span className="text-sm text-muted-foreground">
            ({items.length})
          </span>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="btn-danger p-2 rounded-full hover:text-red-500 hover:bg-red-500/10 text-sm flex items-center gap-2 cursor-pointer"
          >
            <HiTrash /> Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <HiClock className="mx-auto text-6xl text-muted-foreground/30 mb-4" />
          <p className="text-foreground/80 text-lg">No watch history yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Movies and shows you view will appear here.
          </p>
          <Link to="/movies" className="btn-primary inline-block mt-4">
            Browse Movies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link
              key={item._id}
              to={`/${item.mediaType}/${item.tmdbId || ""}`}
              className="group block"
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
                <div className="absolute top-2 right-2 bg-[var(--custom-primary)]/80 text-black shadow-sm rounded-full px-2 py-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {item.mediaType}
                  </span>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold font-NeuMachina text-foreground truncate group-hover:text-[var(--custom-primary)] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-HelveticaNow">
                    {new Date(item.watchedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
