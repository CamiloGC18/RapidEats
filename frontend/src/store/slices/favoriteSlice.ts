import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Favorite {
  _id: string;
  user: string;
  restaurant: {
    _id: string;
    name: string;
    slug: string;
    logo: string;
    category: string;
    rating: number;
    ratings: {
      average: number;
      count: number;
    };
    estimatedDeliveryTime: string;
    isActive: boolean;
    isFeatured: boolean;
  };
  addedAt: string;
  notes?: string;
}

interface FavoriteState {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    byCategory: Array<{ _id: string; count: number }>;
  } | null;
}

const initialState: FavoriteState = {
  favorites: [],
  loading: false,
  error: null,
  stats: null,
};

// Async thunks
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching favorites');
    }
  }
);

export const addFavorite = createAsyncThunk(
  'favorites/add',
  async ({ restaurantId, notes }: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/favorites`,
        { restaurantId, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error adding favorite');
    }
  }
);

export const removeFavorite = createAsyncThunk(
  'favorites/remove',
  async (restaurantId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/favorites/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return restaurantId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error removing favorite');
    }
  }
);

export const checkFavorite = createAsyncThunk(
  'favorites/check',
  async (restaurantId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/favorites/check/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error checking favorite');
    }
  }
);

export const fetchFavoriteStats = createAsyncThunk(
  'favorites/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/favorites/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching stats');
    }
  }
);

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.favorites = [];
      state.stats = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Add favorite
      .addCase(addFavorite.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites.unshift(action.payload);
      })
      .addCase(addFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Remove favorite
      .addCase(removeFavorite.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFavorite.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = state.favorites.filter(
          f => f.restaurant._id !== action.payload
        );
      })
      .addCase(removeFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch stats
      .addCase(fetchFavoriteStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearFavorites, clearError } = favoriteSlice.actions;
export default favoriteSlice.reducer;
