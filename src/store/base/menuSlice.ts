import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

interface Menu {
  id: string
  name: string
  email: string
  role: string
}

interface menuState {
  menu: Menu[]
  loading: boolean
  error: string | null
}

const initialState: menuState = {
  menu: [],
  loading: false,
  error: null
}

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setmenu: (state, action: PayloadAction<Menu[]>) => {
      state.menu = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    }
  }
})

export const { setmenu, setLoading, setError } = menuSlice.actions
export default menuSlice.reducer
