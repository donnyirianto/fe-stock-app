'use server'

import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'

const backend = axios.create({
  baseURL: process.env.BACKEND_URL,
  withCredentials: true
})

export async function fetchFromBackend(path: string, options: AxiosRequestConfig = {}, tokenRefresh?: string) {
  try {
    const res = await backend.request({
      url: path,
      method: options.method || 'GET',
      headers: options.headers,
      data: options.data // Ganti 'body' dengan 'data'
    })

    return { data: res.data, newAccessToken: null } // Tidak ada refresh token, return data biasa
  } catch (error: any) {
    const status = error.response?.status
    const errorMessage = error.response?.data?.message || 'Request failed'

    if (status === 401 && tokenRefresh) {
      const newTokens = await refreshToken(tokenRefresh)

      if (!newTokens) {
        throw new Error('Session expired')
      }

      // Ulangi request dengan token yang baru
      const retryRes = await backend.request({
        url: path,
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${newTokens.accessToken}`
        }
      })

      return { data: retryRes.data, newTokens } // Return accessToken baru ke Redux
    }

    throw new Error(errorMessage)
  }
}

async function refreshToken(refreshToken: string) {
  try {
    const res = await backend.get('/auth/refresh-token', {
      headers: { Authorization: `Bearer ${refreshToken}` }
    })

    if (res.status === 200 && res.data.Status === 'success') {
      return {
        accessToken: res.data.data.accessToken,
        refreshToken: res.data.data.refreshToken
      }
    }

    return null
  } catch {
    return null
  }
}
