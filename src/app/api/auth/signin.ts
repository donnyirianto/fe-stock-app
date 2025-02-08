'use server'

import { AuthError } from 'next-auth'

import { signIn } from '@/lib/auth'

export async function handleCredentialsSignin({ username, password }: { username: string; password: string }) {
  try {
    const usersData = await signIn('credentials', { username, password, redirect: false })

    return usersData
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            message: 'User / Password tidak sesuai!'
          }
        default:
          return {
            message: 'Server Sedang Sibuk, Silahkan coba beberapa saat lagi!'
          }
      }
    }

    throw error
  }
}
