import { NextResponse } from 'next/server'

import { signOut } from '@/lib/auth'

export async function POST() {
  try {
    await signOut({ redirect: false })

    // Kirim respons sukses ke client
    return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error during sign out:', error)

    // Kirim respons error
    return NextResponse.json({ message: 'Failed to sign out' }, { status: 500 })
  }
}
