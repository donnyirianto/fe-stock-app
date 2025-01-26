import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { signInSchema } from '@/lib/zod'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'Email' },
        password: { label: 'Password', type: 'password', placeholder: 'Password' }
      },
      async authorize(credentials) {
        let user = null

        // validate credentials
        const parsedCredentials = signInSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          console.error('Invalid credentials:', parsedCredentials.error.errors)

          return null
        }

        // get user
        const { email, password } = parsedCredentials.data

        if (email === 'admin@gmail.com' && password === 'admin123456') {
          user = {
            id: '1',
            name: 'Aditya Singh',
            email: 'admin',
            role: 'admin'
          }
        }

        console.log('User berhasil login')

        if (!user) {
          console.log('Invalid credentials')

          return null
        }

        return user
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
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.email = user.email as string
        token.name = user.name as string
        token.role = user.role as string
      }

      if (trigger === 'update' && session) {
        token = { ...token, ...session }
      }

      return token
    },
    session({ session, token }) {
      session.user = {
        id: token.id ?? null,
        name: token.name ?? null,
        email: token.email ?? null,
        role: token.role ?? 'user'
      }

      return session
    }
  },
  pages: {
    signIn: '/login'
  }
})
