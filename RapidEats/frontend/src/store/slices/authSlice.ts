import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface User {
  id: string
  name: string
  email: string
  picture: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('accessToken'),
  isAuthenticated: false,
  loading: true,
  error: null,
}

export const initializeAuth = createAsyncThunk('auth/initialize', async () => {
  const token = localStorage.getItem('accessToken')
  const userStr = localStorage.getItem('user')

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      return { user, token }
    } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      throw error
    }
  }
  throw new Error('No auth data')
})

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await axios.post(`${API_URL}/auth/logout`)
  } catch (error) {
    console.error('Logout error:', error)
  }
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
  delete axios.defaults.headers.common['Authorization']
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.loading = false
      localStorage.setItem('accessToken', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        state.loading = false
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false
        state.isAuthenticated = false
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  },
})

export const { setCredentials, clearError } = authSlice.actions
export default authSlice.reducer
