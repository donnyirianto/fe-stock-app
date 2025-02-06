'use client'
import { useState } from 'react'

import { Provider } from 'react-redux' // Pastikan ini benar

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { store } from '@/store/store' // Sesuaikan path dengan struktur proyekmu

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )
}
