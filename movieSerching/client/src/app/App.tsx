import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { getMe } from "@/store/slices/authSlice";

import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import AdminRoute from "@/components/common/AdminRoute";
import Loader from "@/components/common/Loader";

// Eagerly load homepage (critical path)
import HomePage from "@/features/home/HomePage";

// Lazy load non-critical routes for smaller initial bundle
const MoviesPage = lazy(() => import("@/features/movies/MoviesPage"));
const TvShowsPage = lazy(() => import("@/features/tv/TvShowsPage"));
const TrendingPage = lazy(() => import("@/features/trending/TrendingPage"));
const SearchPage = lazy(() => import("@/features/search/SearchPage"));
const MovieDetailPage = lazy(() => import("@/features/detail/MovieDetailPage"));
const PersonDetailPage = lazy(
  () => import("@/features/person/PersonDetailPage"),
);
const FavoritesPage = lazy(() => import("@/features/favorites/FavoritesPage"));
const WatchHistoryPage = lazy(
  () => import("@/features/history/WatchHistoryPage"),
);
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const SignupPage = lazy(() => import("@/features/auth/SignupPage"));
const AdminDashboard = lazy(() => import("@/features/admin/AdminDashboard"));
const AdminMovies = lazy(() => import("@/features/admin/AdminMovies"));
const AdminUsers = lazy(() => import("@/features/admin/AdminUsers"));
const NotFoundPage = lazy(() => import("@/features/notfound/NotFoundPage"));

export default function App() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(getMe());
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
