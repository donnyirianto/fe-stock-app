'use server'

import { AuthError } from 'next-auth'

import { signIn, signOut } from '@/auth'

export async function handleCredentialsSignin({ username, password }: { username: string; password: string }) {
  try {
    const usersData = await signIn('credentials', { username, password, redirectTo: '/home' })

    return usersData
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            message: 'Invalid credentials'
          }
        default:
          return {
            message: 'Something went wrong.'
          }
      }
    }

    throw error
  }
}

export async function handleSignOut() {
  await signOut()
}
