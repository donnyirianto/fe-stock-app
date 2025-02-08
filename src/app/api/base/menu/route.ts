import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { fetchFromBackend } from '@/lib/fetchFromBackend'

export async function GET(req: NextRequest) {
  try {
    const tokenAccess = req.headers.get('Authorization')?.replace('Bearer ', '')
    const tokenRefresh = req.headers.get('x-refresh-token')

    if (!tokenAccess || !tokenRefresh) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    // Ambil data dan cek apakah ada token baru
    const { data, newTokens } = await fetchFromBackend(
      '/base/menu',
      { headers: { Authorization: `Bearer ${tokenAccess}` } },
      tokenRefresh
    )

    // Response ke client (data API + token baru jika ada)
    return NextResponse.json({ data, newTokens }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
