import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { movieService } from "@/services/movieService";
import type { TMDBMovie, TMDBPerson, TMDBMovieDetail, TMDBPersonDetail, TMDBResponse, Genre } from "@/types";

export type SearchCategory = "all" | "movie" | "tv" | "person";

// Union type for search results that can include movies, TV shows, or people
type SearchResultItem = (TMDBMovie & { media_type?: string }) | (TMDBPerson & { media_type?: string });

interface MovieState {
  trending: TMDBMovie[];
  popular: TMDBMovie[];
  topRated: TMDBMovie[];
  nowPlaying: TMDBMovie[];
  searchResults: SearchResultItem[];
  searchQuery: string;
  searchPage: number;
  searchTotalPages: number;
  searchCategory: SearchCategory;
  searchTotalResults: number;
  isSearching: boolean;
  movieDetail: TMDBMovieDetail | null;
  personDetail: TMDBPersonDetail | null;
  genres: Genre[];
  discoverResults: TMDBMovie[];
  discoverPage: number;
  discoverTotalPages: number;
  isLoading: boolean;
  isDetailLoading: boolean;
  error: string | null;
}

const initialState: MovieState = {
  trending: [],
  popular: [],
  topRated: [],
  nowPlaying: [],
  searchResults: [],
  searchQuery: "",
  searchPage: 1,
  searchTotalPages: 1,
  searchCategory: "all",
  searchTotalResults: 0,
  isSearching: false,
  movieDetail: null,
  personDetail: null,
  genres: [],
  discoverResults: [],
  discoverPage: 1,
  discoverTotalPages: 1,
  isLoading: false,
  isDetailLoading: false,
  error: null,
};

export const fetchTrending = createAsyncThunk(
  "movies/fetchTrending",
  async (params: { media?: string; time?: string } = {}, { rejectWithValue }) => {
    try {
      return await movieService.getTrending(params.media, params.time);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch trending");
    }
  }
);

export const fetchPopular = createAsyncThunk(
  "movies/fetchPopular",
  async (params: { type?: string; page?: number } = {}, { rejectWithValue }) => {
    try {
      return await movieService.getPopular(params.type, params.page);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch popular");
    }
  }
);

export const fetchTopRated = createAsyncThunk(
  "movies/fetchTopRated",
  async (params: { type?: string; page?: number } = {}, { rejectWithValue }) => {
    try {
      return await movieService.getTopRated(params.type, params.page);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch top rated");
    }
  }
);

export const fetchMovieDetail = createAsyncThunk(
  "movies/fetchMovieDetail",
  async ({ id, type }: { id: number; type: "movie" | "tv" }, { rejectWithValue }) => {
    try {
      return await movieService.getDetail(id, type);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch details");
    }
  }
);

export const fetchPersonDetail = createAsyncThunk(
  "movies/fetchPersonDetail",
  async (id: number, { rejectWithValue }) => {
    try {
      return await movieService.getPersonDetail(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch person details");
    }
  }
);

export const searchMulti = createAsyncThunk(
  "movies/searchMulti",
  async ({ query, page }: { query: string; page: number }, { rejectWithValue }) => {
    try {
      const data = await movieService.searchMulti(query, page);
      return { ...data, query, page };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Search failed");
    }
  }
);

export const searchByCategory = createAsyncThunk(
  "movies/searchByCategory",
  async (
    { query, page, category }: { query: string; page: number; category: SearchCategory },
    { rejectWithValue, signal }
  ) => {
    try {
      let data: TMDBResponse<SearchResultItem>;
      const opts = { signal };
      switch (category) {
        case "movie":
          data = await movieService.searchMovies(query, page, opts);
          break;
        case "tv":
          data = await movieService.searchTv(query, page, opts);
          break;
        case "person":
          data = await movieService.searchPeople(query, page, opts) as TMDBResponse<SearchResultItem>;
          break;
        default:
          data = await movieService.searchMulti(query, page, opts);
          break;
      }
      return { ...data, query, page, category };
    } catch (err: any) {
      if (err.name === "CanceledError" || err.name === "AbortError") {
        return rejectWithValue("cancelled");
      }
      return rejectWithValue(err.response?.data?.message || "Search failed");
    }
  }
);

export const fetchGenres = createAsyncThunk(
  "movies/fetchGenres",
  async (type: "movie" | "tv" = "movie", { rejectWithValue }) => {
    try {
      return await movieService.getGenres(type);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch genres");
    }
  }
);

export const discoverMovies = createAsyncThunk(
  "movies/discover",
  async (
    params: { type?: string; page?: number; genre?: string; sortBy?: string; year?: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await movieService.discover(params);
      return { ...data, page: params.page || 1 };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Discovery failed");
    }
  }
);

const movieSlice = createSlice({
  name: "movies",
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.searchResults = [];
      state.searchQuery = "";
      state.searchPage = 1;
      state.searchTotalPages = 1;
      state.searchTotalResults = 0;
    },
    clearDetail: (state) => {
      state.movieDetail = null;
      state.personDetail = null;
    },
    clearDiscover: (state) => {
      state.discoverResults = [];
      state.discoverPage = 1;
      state.discoverTotalPages = 1;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSearchCategory: (state, action) => {
      state.searchCategory = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Trending
    builder
      .addCase(fetchTrending.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        state.isLoading = false;
        state.trending = action.payload.results;
      })
      .addCase(fetchTrending.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Popular
    builder
      .addCase(fetchPopular.pending, (state) => { state.isLoading = true; })
      .addCase(fetchPopular.fulfilled, (state, action) => {
        state.isLoading = false;
        state.popular = action.payload.results;
      })
      .addCase(fetchPopular.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Top Rated
    builder
      .addCase(fetchTopRated.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTopRated.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topRated = action.payload.results;
      })
      .addCase(fetchTopRated.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Movie Detail
    builder
      .addCase(fetchMovieDetail.pending, (state) => { state.isDetailLoading = true; })
      .addCase(fetchMovieDetail.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.movieDetail = action.payload;
      })
      .addCase(fetchMovieDetail.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.error = action.payload as string;
      });

    // Person Detail
    builder
      .addCase(fetchPersonDetail.pending, (state) => { state.isDetailLoading = true; })
      .addCase(fetchPersonDetail.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.personDetail = action.payload;
      })
      .addCase(fetchPersonDetail.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.error = action.payload as string;
      });

    // Search Multi
    builder
      .addCase(searchMulti.pending, (state) => { state.isSearching = true; state.isLoading = true; })
      .addCase(searchMulti.fulfilled, (state, action) => {
        state.isSearching = false;
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.searchResults = action.payload.results;
        } else {
          state.searchResults = [...state.searchResults, ...action.payload.results];
        }
        state.searchQuery = action.payload.query;
        state.searchPage = action.payload.page;
        state.searchTotalPages = action.payload.total_pages;
        state.searchTotalResults = action.payload.total_results;
      })
      .addCase(searchMulti.rejected, (state, action) => {
        state.isSearching = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search by Category
    builder
      .addCase(searchByCategory.pending, (state) => { state.isSearching = true; state.isLoading = true; })
      .addCase(searchByCategory.fulfilled, (state, action) => {
        state.isSearching = false;
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.searchResults = action.payload.results;
        } else {
          state.searchResults = [...state.searchResults, ...action.payload.results];
        }
        state.searchQuery = action.payload.query;
        state.searchPage = action.payload.page;
        state.searchTotalPages = action.payload.total_pages;
        state.searchTotalResults = action.payload.total_results;
        state.searchCategory = action.payload.category;
      })
      .addCase(searchByCategory.rejected, (state, action) => {
        state.isSearching = false;
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Genres
    builder.addCase(fetchGenres.fulfilled, (state, action) => {
      state.genres = action.payload;
    });

    // Discover
    builder
      .addCase(discoverMovies.pending, (state) => { state.isLoading = true; })
      .addCase(discoverMovies.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.discoverResults = action.payload.results;
        } else {
          state.discoverResults = [...state.discoverResults, ...action.payload.results];
        }
        state.discoverPage = action.payload.page;
        state.discoverTotalPages = action.payload.total_pages;
      })
      .addCase(discoverMovies.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSearch, clearDetail, clearDiscover, setSearchQuery, setSearchCategory } = movieSlice.actions;
export default movieSlice.reducer;
