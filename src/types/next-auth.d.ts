// types/next-auth.d.ts

import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    username: string // ID user (diambil dari username backend)
    nama: string // Nama pengguna (diambil dari nama backend)
    role: string // Role pengguna (diambil dari role backend)
    accessToken: string // Token akses (diambil dari token backend)
    refreshToken: string // Refresh token (diambil dari refresh-token backend)
  }
  interface Session {
    user: {
      username: string
      nama: string
      role: string
    } & DefaultSession['user']
    accessToken: string
    refreshToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    username: string // ID user
    nama: string // Nama pengguna
    role: string // Role pengguna
    accessToken: string // Token akses
    refreshToken: string // Refresh token
  }
}
