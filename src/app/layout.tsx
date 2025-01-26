// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'
import { SessionProvider } from 'next-auth/react'

export const metadata = {
  title: 'Stock App',
  description: 'Stock App'
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  // Vars
  const direction = 'ltr'

  return (
    <SessionProvider>
      <html id='__next' lang='en' dir={direction}>
        <body className='flex is-full min-bs-full flex-auto flex-col'>{children}</body>
      </html>
    </SessionProvider>
  )
}

export default RootLayout
