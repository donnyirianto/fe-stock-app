'use client'

import { Provider } from 'react-redux' // Pastikan ini benar

import { store } from '@/store/store' // Sesuaikan path dengan struktur proyekmu

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}
