import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { ZodError } from 'zod'
import { decodeJwt } from 'jose' // Gunakan fungsi decodeJwt dari jose

import { signInSchema } from '@/lib/zod'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'Username' },
        password: { label: 'Password', type: 'password', placeholder: 'Password' }
      },
      authorize: async credentials => {
        try {
          // Kirim request ke API backend

          const parsedCredentials = signInSchema.safeParse(credentials)

          if (!parsedCredentials.success) {
            console.error('Invalid credentials:', parsedCredentials.error.errors)

            return null
          }

          // get user
          const { username, password } = parsedCredentials.data

          const res = await fetch(`${process.env.API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: username,
              password: password
            })
          })

          if (!res.ok) {
            console.error('Failed to authenticate')

            return null
          }

          const result = await res.json()

          if (result.code === 200 && result.status === 'success') {
            // Return user data sesuai respons API backend
            return {
              username: result.data.username,
              nama: result.data.nama,
              role: result.data.role,
              accessToken: result.data.token,
              refreshToken: result.data['refresh-token']
            }
          } else {
            console.error('Authentication failed:', result.message)

            return null
          }
        } catch (error) {
          if (error instanceof ZodError) {
            // Return `null` to indicate that the credentials are invalid
            return null
          }

          console.error('Unexpected error:', error)

          return null
        }
      }
    })
  ],
  callbacks: {
    authorized({ request: { nextUrl }, auth }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      if (pathname.startsWith('/login') && isLoggedIn) {
        return Response.redirect(new URL('/', nextUrl))
      }

      return !!auth
    },
    async jwt({
      token,
      user
    }: {
      token: any
      user?: {
        username: string
        nama: string
        role: string
        accessToken: string
        refreshToken: string
      }
    }) {
      if (user) {
        token.username = user.username
        token.nama = user.nama
        token.role = user.role
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken

        const decoded = decodeJwt(user.accessToken)

        token.exp = decoded.exp
      }

      if (Date.now() > token.exp * 1000) {
        try {
          const res = await fetch(`${process.env.API_BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: token.refreshToken })
          })

          const refreshedTokens = await res.json()

          if (!res.ok) throw new Error('Gagal refresh token')

          token.accessToken = refreshedTokens.accessToken
          token.refreshToken = refreshedTokens.refreshToken
          const decoded = decodeJwt(refreshedTokens.accessToken)

          token.exp = decoded.exp
        } catch (error) {
          return null // Token tidak bisa diperbarui
        }
      }

      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user = {
          username: token.username,
          nama: token.nama,
          role: token.role
        }
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
      }

      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
})
