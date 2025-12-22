import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Topping {
  name: string
  price: number
}

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  toppings: Topping[]
  subtotal: number
  image?: string
}

interface CartState {
  items: CartItem[]
  restaurantId: string | null
  restaurantName: string | null
  subtotal: number
  deliveryCost: number
  discount: number
  total: number
  coupon: {
    code: string
    type: string
    value: number
    description: string
  } | null
}

const initialState: CartState = {
  items: [],
  restaurantId: null,
  restaurantName: null,
  subtotal: 0,
  deliveryCost: 0,
  discount: 0,
  total: 0,
  coupon: null,
}

const calculateTotals = (state: CartState) => {
  state.subtotal = state.items.reduce((sum, item) => sum + item.subtotal, 0)
  state.total = state.subtotal + state.deliveryCost - state.discount
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        restaurantId: string
        restaurantName: string
        product: CartItem
      }>
    ) => {
      if (state.restaurantId && state.restaurantId !== action.payload.restaurantId) {
        state.items = []
      }

      state.restaurantId = action.payload.restaurantId
      state.restaurantName = action.payload.restaurantName

      const existingItem = state.items.find(
        (item) =>
          item.productId === action.payload.product.productId &&
          JSON.stringify(item.toppings) === JSON.stringify(action.payload.product.toppings)
      )

      if (existingItem) {
        existingItem.quantity += action.payload.product.quantity
        existingItem.subtotal = existingItem.quantity * (existingItem.price + existingItem.toppings.reduce((sum, t) => sum + t.price, 0))
      } else {
        state.items.push(action.payload.product)
      }

      calculateTotals(state)
    },
    removeFromCart: (state, action: PayloadAction<number>) => {
      state.items.splice(action.payload, 1)
      if (state.items.length === 0) {
        state.restaurantId = null
        state.restaurantName = null
        state.coupon = null
        state.discount = 0
      }
      calculateTotals(state)
    },
    updateQuantity: (state, action: PayloadAction<{ index: number; quantity: number }>) => {
      const item = state.items[action.payload.index]
      if (item) {
        item.quantity = action.payload.quantity
        item.subtotal = item.quantity * (item.price + item.toppings.reduce((sum, t) => sum + t.price, 0))
        calculateTotals(state)
      }
    },
    setDeliveryCost: (state, action: PayloadAction<number>) => {
      state.deliveryCost = action.payload
      calculateTotals(state)
    },
    applyCoupon: (
      state,
      action: PayloadAction<{
        code: string
        type: string
        value: number
        description: string
        discount: number
      }>
    ) => {
      state.coupon = {
        code: action.payload.code,
        type: action.payload.type,
        value: action.payload.value,
        description: action.payload.description,
      }
      state.discount = action.payload.discount
      calculateTotals(state)
    },
    removeCoupon: (state) => {
      state.coupon = null
      state.discount = 0
      calculateTotals(state)
    },
    clearCart: (state) => {
      state.items = []
      state.restaurantId = null
      state.restaurantName = null
      state.subtotal = 0
      state.deliveryCost = 0
      state.discount = 0
      state.total = 0
      state.coupon = null
    },
  },
})

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  setDeliveryCost,
  applyCoupon,
  removeCoupon,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer
