import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

interface UserData {
  username: string | null
  nama: string | null
  role: string | null
}
interface AuthState {
  user: UserData | null
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
    login: (state, action: PayloadAction<{ user: UserData; tokenAccess: string; tokenRefresh: string }>) => {
      state.user = action.payload.user
      state.tokenAccess = action.payload.tokenAccess
      state.tokenRefresh = action.payload.tokenRefresh
    },
    logout: state => {
      state.user = null
      state.tokenAccess = null
      state.tokenRefresh = null
    },
    setTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.tokenAccess = action.payload.accessToken
      state.tokenRefresh = action.payload.refreshToken
    }
  }
})

export const { login, logout, setTokens } = authSlice.actions
export default authSlice.reducer
