import { configureStore } from '@reduxjs/toolkit'

import menuReducer from './base/menuSlice'

export const store = configureStore({
  reducer: {
    menu: menuReducer
  }
})

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
