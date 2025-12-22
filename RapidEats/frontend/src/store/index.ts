import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import cartReducer from './slices/cartSlice'
import restaurantReducer from './slices/restaurantSlice'
import orderReducer from './slices/orderSlice'
import reviewReducer from './slices/reviewSlice'
import favoriteReducer from './slices/favoriteSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    restaurant: restaurantReducer,
    order: orderReducer,
    review: reviewReducer,
    favorite: favoriteReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
