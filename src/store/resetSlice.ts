import { createSlice } from '@reduxjs/toolkit'

// Slice untuk reset state
const resetSlice = createSlice({
  name: 'reset',
  initialState: {},
  reducers: {
    resetState: () => ({}) // Aksi untuk mereset state
  }
})

export const { resetState } = resetSlice.actions

export default resetSlice.reducer
