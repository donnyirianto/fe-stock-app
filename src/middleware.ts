export { auth as middleware } from '@/auth'

// import { auth } from '@/src/lib/auth/next-auth-config'
// import { NextResponse } from 'next/server'
// import { env } from './env'

// const isDev = env.NODE_ENV === 'development'
// type NextAuthRequest = {
//   headers: Headers
//   url: string
//   auth?: unknown
// }

// const handleAuthRequest = (request: NextAuthRequest) => {
//   const isAuthenticated = !!request.auth
//   if (isAuthenticated && request.url.includes('/auth')) {
//     return NextResponse.redirect(new URL('/dashboard', request.url))
//   }

//   if (!isAuthenticated && !request.url.includes('/auth')) {
//     return NextResponse.redirect(new URL('/auth/sign-in', request.url))
//   }

//   return null
// }

// export default auth((request) => {
//   const response = handleAuthRequest(request)
//   if (response) return response

//   return NextResponse.next()
// })

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}
