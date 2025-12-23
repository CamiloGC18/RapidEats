import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

interface Review {
  _id: string;
  user: {
    _id: string;
    name: string;
    picture: string;
  };
  restaurant: string;
  order: string;
  rating: number;
  foodRating?: number;
  deliveryRating?: number;
  comment?: string;
  images?: string[];
  helpful: string[];
  helpfulCount: number;
  response?: {
    text: string;
    date: string;
  };
  isVerifiedPurchase: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewState {
  reviews: Review[];
  userReviews: Review[];
  stats: {
    average: number;
    count: number;
    distribution: { [key: string]: number };
  } | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

const initialState: ReviewState = {
  reviews: [],
  userReviews: [],
  stats: null,
  loading: false,
  error: null,
  pagination: null,
};

// Async thunks
export const fetchRestaurantReviews = createAsyncThunk(
  'reviews/fetchRestaurantReviews',
  async ({ restaurantId, page = 1, limit = 10, rating }: any) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (rating) params.append('rating', rating);
    
    const response = await axios.get(`${API_URL}/reviews/restaurant/${restaurantId}?${params}`);
    return response.data;
  }
);

export const fetchUserReviews = createAsyncThunk(
  'reviews/fetchUserReviews',
  async ({ page = 1, limit = 10 }: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/reviews/user`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching reviews');
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error creating review');
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, data }: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/reviews/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error updating review');
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting review');
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  'reviews/markHelpful',
  async (id: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/reviews/${id}/helpful`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return { id, data: response.data.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error marking review helpful');
    }
  }
);

export const fetchReviewStats = createAsyncThunk(
  'reviews/fetchStats',
  async (restaurantId: string) => {
    const response = await axios.get(`${API_URL}/reviews/restaurant/${restaurantId}/stats`);
    return response.data.data;
  }
);

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviews: (state) => {
      state.reviews = [];
      state.stats = null;
      state.pagination = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch restaurant reviews
      .addCase(fetchRestaurantReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurantReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.stats = action.payload.stats;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRestaurantReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reviews';
      })
      
      // Fetch user reviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews.unshift(action.payload.data);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.userReviews = state.userReviews.filter(r => r._id !== action.payload);
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      })
      
      // Mark helpful
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const review = state.reviews.find(r => r._id === action.payload.id);
        if (review) {
          review.helpfulCount = action.payload.data.helpful;
        }
      })
      
      // Fetch stats
      .addCase(fetchReviewStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearReviews, clearError } = reviewSlice.actions;
export default reviewSlice.reducer;
