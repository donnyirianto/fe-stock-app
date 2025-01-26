'use client'

import { useSession } from 'next-auth/react'

export default function Page() {
  const { data: session, status } = useSession()

  // Cek status autentikasi saat ini
  if (status === 'loading') {
    return <p>Loading...</p> // Menunggu session selesai dimuat
  }

  if (status === 'unauthenticated') {
    return <p>You need to log in first.</p>
  }

  if (!session?.user) return null

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <h1 className='text-2xl font-bold'>Home Page</h1>
      <p className='mt-4 text-lg'>Welcome, {session.user.nama}!</p>
      <p className='mt-2 text-sm'>Username: {session.user.username}</p>
      <p className='mt-2 text-sm'>Role: {session.user.role}</p>
    </div>
  )
}
