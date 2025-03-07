//import { getToken } from 'next-auth/jwt'

export { auth as middleware } from '@/lib/auth'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
}
