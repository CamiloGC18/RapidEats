import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface Order {
  _id: string
  orderNumber: string
  status: string
  items: any[]
  customer: any
  pricing: {
    subtotal: number
    deliveryCost: number
    discount: number
    total: number
  }
  createdAt: string
  estimatedDeliveryTime: string
  restaurantId: any
  deliveryId?: any
}

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  loading: boolean
  error: string | null
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
}

export const placeOrder = createAsyncThunk('order/place', async (orderData: any) => {
  const response = await axios.post(`${API_URL}/orders`, orderData)
  return response.data
})

export const fetchUserOrders = createAsyncThunk('order/fetchUserOrders', async () => {
  const response = await axios.get(`${API_URL}/orders`)
  return response.data.orders
})

export const fetchOrderById = createAsyncThunk('order/fetchById', async (orderId: string) => {
  const response = await axios.get(`${API_URL}/orders/${orderId}`)
  return response.data
})

export const fetchOrderTracking = createAsyncThunk(
  'order/fetchTracking',
  async (orderId: string) => {
    const response = await axios.get(`${API_URL}/orders/${orderId}/tracking`)
    return response.data
  }
)

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    updateOrderStatus: (state, action) => {
      const order = state.orders.find((o) => o._id === action.payload.orderId)
      if (order) {
        order.status = action.payload.status
      }
      if (state.currentOrder && state.currentOrder._id === action.payload.orderId) {
        state.currentOrder.status = action.payload.status
      }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false
        state.currentOrder = action.payload
        state.orders.unshift(action.payload)
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to place order'
      })
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false
        state.orders = action.payload
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch orders'
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.currentOrder = action.payload
      })
      .addCase(fetchOrderTracking.fulfilled, (state, action) => {
        state.currentOrder = action.payload
      })
  },
})

export const { updateOrderStatus, clearCurrentOrder } = orderSlice.actions
export default orderSlice.reducer
