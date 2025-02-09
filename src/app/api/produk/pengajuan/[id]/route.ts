import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { fetchFromBackend } from '@/lib/fetchFromBackend'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  }

  try {
    const tokenAccess = req.headers.get('Authorization')?.replace('Bearer ', '')
    const tokenRefresh = req.headers.get('x-refresh-token')

    if (!tokenAccess || !tokenRefresh) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const { data, newTokens } = await fetchFromBackend(
      `/pengajuan/edit/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenAccess}`
        }
      },
      tokenRefresh
    )

    return NextResponse.json({ data, newTokens }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id) return NextResponse.json({ error: 'Menu ID is required' }, { status: 400 })

  try {
    const tokenAccess = req.headers.get('Authorization')?.replace('Bearer ', '')
    const tokenRefresh = req.headers.get('x-refresh-token')

    if (!tokenAccess || !tokenRefresh) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    // Ambil data dari request body
    const body = await req.json()

    // Panggil API backend
    const { data, newTokens } = await fetchFromBackend(
      `/pengajuan/edit/${id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenAccess}`
        },
        data: JSON.stringify(body) // ✅ Ubah dari `data` ke `body`
      },
      tokenRefresh
    )

    return NextResponse.json({ data, newTokens }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
