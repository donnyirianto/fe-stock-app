import { ReduxProvider } from '@/store/Provider'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'

export const metadata = {
  title: 'Stock App',
  description: 'Stock App'
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  // Vars
  const direction = 'ltr'

  return (
    <html id='__next' lang='en' dir={direction}>
      <body className='flex is-full min-bs-full flex-auto flex-col'>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}

export default RootLayout
