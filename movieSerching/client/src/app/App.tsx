import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { getMe } from "@/store/slices/authSlice";
import { fetchFavorites } from "@/store/slices/favoriteSlice";

import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AdminRoute from "@/components/common/AdminRoute";
import Loader from "@/components/common/Loader";

// Eagerly load homepage (critical path)
import HomePage from "@/features/home/pages/HomePage";

// Lazy load non-critical routes for smaller initial bundle
const MoviesPage = lazy(() => import("@/features/movies/pages/MoviesPage"));
const TvShowsPage = lazy(() => import("@/features/tv/pages/TvShowsPage"));
const TrendingPage = lazy(
  () => import("@/features/trending/pages/TrendingPage"),
);
const SearchPage = lazy(() => import("@/features/search/pages/SearchPage"));
const SpotlightPage = lazy(
  () => import("@/features/spotlight/pages/SpotlightPage"),
);
const MovieDetailPage = lazy(
  () => import("@/features/detail/pages/MovieDetailPage"),
);
const PersonDetailPage = lazy(
  () => import("@/features/person/pages/PersonDetailPage"),
);
const FavoritesPage = lazy(
  () => import("@/features/favorites/pages/FavoritesPage"),
);
const WatchHistoryPage = lazy(
  () => import("@/features/history/pages/WatchHistoryPage"),
);
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const SignupPage = lazy(() => import("@/features/auth/pages/SignupPage"));
const AdminDashboard = lazy(
  () => import("@/features/admin/pages/AdminDashboardPage"),
);
const AdminMovies = lazy(
  () => import("@/features/admin/pages/AdminMoviesPage"),
);
const AdminUsers = lazy(() => import("@/features/admin/pages/AdminUsersPage"));
const NotFoundPage = lazy(() => import("@/features/notfound/NotFoundPage"));

export default function App() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
      dispatch(fetchFavorites());
    }
  }, [dispatch, token]);

  return (
    <Suspense fallback={<Loader size="md" />}>
      <Routes>
        <Route element={<Layout />}>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/tv" element={<TvShowsPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/spotlight" element={<SpotlightPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/tv/:id" element={<MovieDetailPage />} />
          <Route path="/person/:id" element={<PersonDetailPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<WatchHistoryPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/movies" element={<AdminMovies />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
