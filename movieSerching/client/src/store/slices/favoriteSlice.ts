import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { favoriteService } from "@/services/favoriteService";
import type { FavoriteItem } from "@/types";

interface FavoriteState {
  items: FavoriteItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavoriteState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchFavorites = createAsyncThunk(
  "favorites/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await favoriteService.getFavorites();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch favorites");
    }
  }
);

export const addFavorite = createAsyncThunk(
  "favorites/add",
  async (
    data: {
      tmdbId?: number;
      movieId?: string;
      title: string;
      posterUrl: string;
      mediaType: "movie" | "tv";
      rating?: number;
      releaseDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await favoriteService.addFavorite(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add favorite");
    }
  }
);

export const removeFavorite = createAsyncThunk(
  "favorites/remove",
  async (id: string, { rejectWithValue }) => {
    try {
      await favoriteService.removeFavorite(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove favorite");
    }
  }
);

export const removeFavoriteByTmdbId = createAsyncThunk(
  "favorites/removeByTmdbId",
  async (tmdbId: number, { rejectWithValue }) => {
    try {
      await favoriteService.removeFavoriteByTmdbId(tmdbId);
      return tmdbId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove favorite");
    }
  }
);

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavorites: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(addFavorite.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });

    builder
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });

    builder
      .addCase(removeFavoriteByTmdbId.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.tmdbId !== action.payload);
      });
  },
});

export const { clearFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;
