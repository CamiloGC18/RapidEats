import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface Restaurant {
  _id: string
  name: string
  slug: string
  description: string
  category: string
  logo: string
  banner: string
  zone: string
  estimatedDeliveryTime: string
  isActive: boolean
  isFeatured: boolean
  rating: number
  totalOrders: number
}

interface Product {
  _id: string
  restaurantId: string
  name: string
  description: string
  price: number
  category: string
  image: string
  isActive: boolean
  hasToppings: boolean
  toppings: Array<{ name: string; price: number }>
}

interface RestaurantState {
  restaurants: Restaurant[]
  currentRestaurant: Restaurant | null
  products: Product[]
  loading: boolean
  error: string | null
}

const initialState: RestaurantState = {
  restaurants: [],
  currentRestaurant: null,
  products: [],
  loading: false,
  error: null,
}

export const fetchRestaurants = createAsyncThunk(
  'restaurant/fetchAll',
  async (params?: { category?: string; search?: string; featured?: boolean }) => {
    const queryParams = new URLSearchParams()
    if (params?.category) queryParams.append('category', params.category)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.featured) queryParams.append('featured', 'true')

    const response = await axios.get(`${API_URL}/restaurants?${queryParams}`)
    return response.data
  }
)

export const fetchRestaurantBySlug = createAsyncThunk(
  'restaurant/fetchBySlug',
  async (slug: string) => {
    const response = await axios.get(`${API_URL}/restaurants/${slug}`)
    return response.data
  }
)

const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    clearCurrentRestaurant: (state) => {
      state.currentRestaurant = null
      state.products = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRestaurants.fulfilled, (state, action) => {
        state.loading = false
        state.restaurants = action.payload
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch restaurants'
      })
      .addCase(fetchRestaurantBySlug.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRestaurantBySlug.fulfilled, (state, action) => {
        state.loading = false
        state.currentRestaurant = action.payload.restaurant
        state.products = action.payload.products
      })
      .addCase(fetchRestaurantBySlug.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch restaurant'
      })
  },
})

export const { clearCurrentRestaurant } = restaurantSlice.actions
export default restaurantSlice.reducer
