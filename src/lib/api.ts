import axios from 'axios'
import { signOut } from 'next-auth/react'

import { auth } from './auth'

const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL, // URL backend Anda
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
})

// Interceptor untuk request
apiClient.interceptors.request.use(async config => {
  const session = await auth()

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }

  return config
})

// Interceptor untuk response
apiClient.interceptors.response.use(
  response => response, // Kembalikan response langsung jika sukses
  async error => {
    const originalRequest = error.config

    // Jika error 401 dan request belum di-retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // Tandai request sudah di-retry

      try {
        // Memperbarui session untuk mendapatkan access token baru
        const refreshResponse = await apiClient.get('/auth/refresh-token')

        if (refreshResponse.status === 200) {
          const newSession = await auth() // Dapatkan session terbaru

          if (newSession?.accessToken) {
            // Perbarui Authorization header dengan token baru
            originalRequest.headers.Authorization = `Bearer ${newSession.accessToken}`

            // Ulangi request sebelumnya
            return apiClient(originalRequest)
          }
        }
      } catch (refreshError) {
        await signOut({ redirectTo: '/login' })
      }
    }

    return Promise.reject(error) // Kembalikan error untuk status selain 401
  }
)

export default apiClient
