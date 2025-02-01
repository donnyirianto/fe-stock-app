import { configureStore } from '@reduxjs/toolkit'

import rootReducer from '@/store/rootReducer'

export const store = configureStore({
  reducer: rootReducer
})

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
