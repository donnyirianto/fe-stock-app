import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import type { RootState } from '@/store/store'

// Thunk untuk fetch data menu dari backend
export const fetchMenu = createAsyncThunk('menu/fetchMenu', async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState

    if (state.menu?.data?.length > 0) {
      return state.menu.data
    }

    const response = await fetch(`/api/base/menu`) // Request ke API Route

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json() // Ubah response ke JSON

    return data
  } catch (error: any) {
    return rejectWithValue(error.message || 'Gagal mengambil data menu')
  }
})

const initialState = {
  data: [] as any[],
  loading: false,
  error: null as string | null
}

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchMenu.pending, state => {
        state.loading = true
        state.error = null // Reset error saat mulai request
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload.data
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export default menuSlice.reducer
