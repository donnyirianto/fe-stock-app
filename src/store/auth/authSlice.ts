import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  user: string | null
  tokenAccess: string | null
  tokenRefresh: string | null
}

const initialState: AuthState = {
  user: null,
  tokenAccess: null,
  tokenRefresh: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ user: string; tokenAccess: string; tokenRefresh: string }>) => {
      state.user = action.payload.user
      state.tokenAccess = action.payload.tokenAccess
      state.tokenRefresh = action.payload.tokenRefresh
    },
    logout: state => {
      state.user = null
      state.tokenAccess = null
      state.tokenRefresh = null
    }
  }
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
