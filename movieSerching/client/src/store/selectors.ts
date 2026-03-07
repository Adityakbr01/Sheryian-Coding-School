import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from ".";

// ---- Auth Selectors ----
const selectAuthState = (state: RootState) => state.auth;

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (auth) => auth.isAuthenticated
);

export const selectUser = createSelector(
  selectAuthState,
  (auth) => auth.user
);

export const selectIsAdmin = createSelector(
  selectUser,
  (user) => user?.role === "admin"
);

// ---- Movie Selectors ----
const selectMovieState = (state: RootState) => state.movies;

export const selectTrending = createSelector(
  selectMovieState,
  (movies) => movies.trending
);

export const selectPopular = createSelector(
  selectMovieState,
  (movies) => movies.popular
);

export const selectTopRated = createSelector(
  selectMovieState,
  (movies) => movies.topRated
);

export const selectMovieDetail = createSelector(
  selectMovieState,
  (movies) => movies.movieDetail
);

export const selectPersonDetail = createSelector(
  selectMovieState,
  (movies) => movies.personDetail
);

export const selectSearchState = createSelector(
  selectMovieState,
  (movies) => ({
    searchResults: movies.searchResults,
    searchQuery: movies.searchQuery,
    searchPage: movies.searchPage,
    searchTotalPages: movies.searchTotalPages,
    searchCategory: movies.searchCategory,
    searchTotalResults: movies.searchTotalResults,
    isSearching: movies.isSearching,
  })
);

export const selectDiscoverState = createSelector(
  selectMovieState,
  (movies) => ({
    discoverResults: movies.discoverResults,
    discoverPage: movies.discoverPage,
    discoverTotalPages: movies.discoverTotalPages,
    genres: movies.genres,
  })
);

export const selectIsLoading = createSelector(
  selectMovieState,
  (movies) => movies.isLoading
);

export const selectIsDetailLoading = createSelector(
  selectMovieState,
  (movies) => movies.isDetailLoading
);

// ---- Favorites Selectors ----
const selectFavoritesState = (state: RootState) => state.favorites;

export const selectFavoriteItems = createSelector(
  selectFavoritesState,
  (favs) => favs.items
);

export const selectFavoriteIds = createSelector(
  selectFavoriteItems,
  (items) => new Set(items.map((f) => f.tmdbId))
);

// ---- Watch History Selectors ----
const selectWatchHistoryState = (state: RootState) => state.watchHistory;

export const selectWatchHistoryItems = createSelector(
  selectWatchHistoryState,
  (wh) => wh.items
);
