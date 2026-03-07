import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { watchHistoryService } from "@/services/watchHistoryService";
import type { WatchHistoryItem } from "@/types";

interface WatchHistoryState {
  items: WatchHistoryItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WatchHistoryState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchWatchHistory = createAsyncThunk(
  "watchHistory/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await watchHistoryService.getHistory();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch history");
    }
  }
);

export const addToHistory = createAsyncThunk(
  "watchHistory/add",
  async (
    data: {
      tmdbId?: number;
      movieId?: string;
      title: string;
      posterUrl: string;
      mediaType: "movie" | "tv";
    },
    { rejectWithValue }
  ) => {
    try {
      return await watchHistoryService.addToHistory(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to add to history");
    }
  }
);

export const clearHistory = createAsyncThunk(
  "watchHistory/clear",
  async (_, { rejectWithValue }) => {
    try {
      await watchHistoryService.clearHistory();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to clear history");
    }
  }
);

const watchHistorySlice = createSlice({
  name: "watchHistory",
  initialState,
  reducers: {
    resetHistory: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWatchHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchWatchHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchWatchHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(addToHistory.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i.tmdbId !== action.payload.tmdbId);
      state.items.unshift(action.payload);
    });

    builder.addCase(clearHistory.fulfilled, () => initialState);
  },
});

export const { resetHistory } = watchHistorySlice.actions;
export default watchHistorySlice.reducer;
