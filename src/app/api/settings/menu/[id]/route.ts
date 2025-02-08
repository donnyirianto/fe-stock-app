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
      `/settings/menu/${id}`,
      { headers: { Authorization: `Bearer ${tokenAccess}` } },
      tokenRefresh
    )

    return NextResponse.json({ data, newTokens }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params

  if (!id) {
    return NextResponse.json({ error: 'Pilih salah satu menu!' }, { status: 400 })
  }

  try {
    const tokenAccess = req.headers.get('Authorization')?.replace('Bearer ', '')
    const tokenRefresh = req.headers.get('x-refresh-token')

    if (!tokenAccess || !tokenRefresh) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const { data, newTokens } = await fetchFromBackend(
      `/settings/menu/${id}`,
      {
        method: 'DELETE',
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
