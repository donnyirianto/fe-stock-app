import axios from 'axios'
import { getSession, signOut } from 'next-auth/react'

const apiClient = axios.create({
  baseURL: process.env.API_BASE_URL, // URL backend Anda
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(async config => {
  const session = await getSession()

  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  response => response, // Jika respons berhasil, kembalikan langsung
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Refresh token
        const refreshResponse = await axios.get('/api/auth/session?update')

        if (refreshResponse.status === 200) {
          const newSession = await getSession() // Perbarui session

          originalRequest.headers.Authorization = `Bearer ${newSession?.accessToken}`

          return apiClient(originalRequest) // Ulangi request dengan token baru
        }
      } catch (refreshError) {
        await signOut() // Logout jika refresh token gagal

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error) // Propagate error jika bukan 401
  }
)

export default apiClient
